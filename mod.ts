import { spawn } from "node:child_process";
import { copyFile, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { text } from "node:stream/consumers";
import * as fdsInspectCore from "@smoke-cloud/fds-inspect-core";

/** Run a command to completion, optionally writing `input` to its stdin. */
async function run(
  cmd: string,
  args: string[],
  opts?: { cwd?: string; input?: string },
): Promise<{ success: boolean; stdout: string; stderr: string }> {
  // On Windows, Node can only run .cmd/.bat files via a shell.
  const shell = process.platform === "win32" && /\.(cmd|bat)$/i.test(cmd);
  const child = spawn(
    shell ? `"${cmd}"` : cmd,
    shell ? args.map((arg) => `"${arg}"`) : args,
    { cwd: opts?.cwd, shell },
  );
  child.stdin.end(opts?.input);
  const [code, stdout, stderr] = await Promise.all([
    new Promise<number | null>((resolve, reject) => {
      child.on("error", reject);
      child.on("close", resolve);
    }),
    text(child.stdout),
    text(child.stderr),
  ]);
  return { success: code === 0, stdout, stderr };
}

export interface GetJsonOpts {
  cwd?: string;
  useTempFile?: boolean;
  tempFileDir?: string;
  fdsVersion?: string;
}

export async function getJson(
  inputPath: string,
  opts?: GetJsonOpts,
): Promise<
  | { success: true; data: fdsInspectCore.fdsJson.FdsFile }
  | {
    success: false;
    error: string;
  }
> {
  let sOut;
  let sErr;
  try {
    const cmd = process.env.FDS_INSPECT_PATH ??
      (process.platform === "win32" ? "fds-inspect.cmd" : "fds-inspect");
    let fileOut: string | undefined;
    if (opts?.useTempFile) {
      fileOut = path.join(opts?.tempFileDir ?? tmpdir(), crypto.randomUUID());
    }
    const args = [inputPath, fileOut ?? "-"];
    if (opts?.fdsVersion) {
      args.push("--fds-version");
      args.push(opts.fdsVersion);
    }
    const output = await run(cmd, args, { cwd: opts?.cwd });
    if (!output.success) {
      throw new Error(output.stderr);
    }
    if (fileOut) {
      sOut = await readFile(fileOut, "utf8");
    } else {
      sOut = output.stdout;
    }
    sErr = output.stderr;
    try {
      return { success: true, data: JSON.parse(sOut) };
    } catch {
      return { success: false, error: sErr };
    }
  } catch (e) {
    console.log(`input: '${sOut}'`);
    throw e;
  }
}

export async function getJsonTemp(
  inputPath: string,
  opts?: GetJsonOpts,
): Promise<
  | { success: true; data: fdsInspectCore.fds.FdsData }
  | {
    success: false;
    error: string;
  }
> {
  const tempDir = await mkdtemp(path.join(tmpdir(), "fds-inspect-"));
  const fn = path.basename(inputPath);
  await copyFile(inputPath, path.join(tempDir, fn));
  const fdsData = await getJson(fn, { ...opts, cwd: tempDir });
  if (fdsData.success) {
    return {
      success: true,
      data: new fdsInspectCore.fds.FdsData(fdsData.data),
    };
  } else {
    return fdsData;
  }
}

export async function getJsonSmv(
  smvPath: string,
  dirPath?: string,
): Promise<fdsInspectCore.SmvData> {
  let s;
  try {
    const cmd = process.env.SMVQ_PATH ??
      (process.platform === "win32" ? "smvq.cmd" : "smvq");
    const cwd = dirPath ?? path.dirname(smvPath);
    const output = await run(cmd, [smvPath], { cwd });
    if (!output.success) {
      throw new Error(output.stderr);
    }
    s = output.stdout;
    const raw = JSON.parse(s);
    return new fdsInspectCore.smv.SmvData(cwd ?? ".", raw);
  } catch (e) {
    console.log(`input: '${s}'`);
    throw e;
  }
}

export async function renderTypstPdf(path: string, typstInput: string) {
  const output = await run("typst", ["compile", "-", path], {
    input: typstInput,
  });
  if (output.success) {
    console.log(output.stdout);
  } else {
    console.log(output.stderr);
  }
}

export function renderVerificationTypst(
  inputSummary: fdsInspectCore.InputSummary,
  verificationSummary: fdsInspectCore.VerificationOutcome[],
  hrrPlotFile?: string,
): string {
  let s = "";
  // Title
  s +=
    `#set document(title: [${inputSummary.chid}], author: "Smoke Cloud")\n\n`;
  s += `= ${inputSummary.chid}\n\n`;
  s += `== Input Summary\n\n`;
  s += `#table(\n`;
  s += `
  columns: (auto,  auto),
  inset: 10pt,
  align: horizon,
  table.header(
    [*Parameter*], [*Value*],
  ),
`;
  s += `  "CHID",\n`;
  s += `  "${inputSummary.chid}",\n`;

  s += `  "Simulation Time",\n`;
  s += `  [${
    inputSummary.simulation_length.toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } s],\n`;

  s += `  "# Burners",\n`;
  s += `  [${inputSummary.n_burners}],\n`;

  s += `  "Total Max. HRR",\n`;
  s += `  [${
    (inputSummary.total_max_hrr / 1000).toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } kW ],\n`;

  s += `  [Heat of Combustion],\n`;
  s += `  [${
    (inputSummary.heat_of_combustion / 1000 / 1000).toLocaleString(
      "en-US",
      {
        minimumSignificantDigits: 4,
        maximumSignificantDigits: 6,
      },
    )
  } MJ/kg ],\n`;

  s += `  [Total Max. Soot Production],\n`;
  s += `  [${
    (inputSummary.total_soot_production * 1000).toLocaleString(
      "en-US",
      {
        minimumSignificantDigits: 4,
        maximumSignificantDigits: 6,
      },
    )
  } g/s ],\n`;

  s += `  [Non-Dimensionalised Ratios],\n`;
  s += `  [ ],\n`;

  s += `  [\\# Sprinklers],\n`;
  s += `  [${inputSummary.n_sprinklers}],\n`;

  s += `  [Sprinkler Activation Temperatures],\n`;
  s += `  [${
    inputSummary.sprinkler_activation_temperatures
      .map(
        (c: number) =>
          c.toLocaleString("en-US", {
            minimumSignificantDigits: 4,
            maximumSignificantDigits: 6,
          }) + "°C",
      )
      .join("\n\n")
  }],\n`;

  s += `  [\\# Detectors],\n`;
  s += `  [${inputSummary.n_smoke_detectors}],\n`;

  s += `  [Smoke Detector Obscurations],\n`;
  s += `  [${
    inputSummary.smoke_detector_obscurations
      .map(
        (c: number) =>
          c.toLocaleString("en-US", {
            minimumSignificantDigits: 4,
            maximumSignificantDigits: 6,
          }) + " %Obs/m",
      )
      .join("\n\n")
  } ],\n`;

  s += `  [\\# Extracts],\n`;
  s += `  [${inputSummary.n_extract_vents}],\n`;

  s += `  [Total Extract Rate],\n`;
  s += `  [${
    inputSummary.total_extract_rate.toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } m³/s],\n`;

  s += `  [\\# Supplies],\n`;
  s += `  [${inputSummary.n_supply_vents}],\n`;

  s += `  [Total Supply Rate],\n`;
  s += `  [${
    inputSummary.total_supply_rate.toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } m³/s],\n`;

  s += `  [\\# Meshes],\n`;
  s += `  [${inputSummary.n_meshes}],\n`;

  s += `  [\\# Cells],\n`;
  s += `  [${inputSummary.n_cells.toLocaleString("en-US")} ],\n`;

  s += `  [Mesh Resolutions],\n`;
  s += `  [
    ${
    inputSummary.mesh_resolutions
      .map(
        (c: fdsInspectCore.fdsJson.Resolution) =>
          `${c.dx.toFixed(3)}×${c.dy.toFixed(3)}×${c.dz.toFixed(3)} m`,
      )
      .join("\n\n")
  }
  ],\n`;
  s += `)\n\n`;
  s += `== Failed Verification Tests\n\n`;
  const res = fdsInspectCore.clearSuccessSummary(verificationSummary);
  if (res.length > 0) {
    for (const testResult of res) {
      s += renderTest(testResult);
    }
  } else {
    s += "No failed tests\n\n";
  }
  s += `== All Verification Tests\n\n`;
  if (verificationSummary) {
    for (const r of verificationSummary) {
      s += renderTest(r);
    }
  }
  if (hrrPlotFile) {
    s += `#figure(
      image("${path.relative(".", hrrPlotFile)}", width: 80%),
      caption: [
        Realised HRR
      ],
    )
    `;
  }
  return s;
}

function renderTest(v: fdsInspectCore.VerificationResult & { id: string }) {
  if (!v) return "";
  let s = "";
  let color;
  if (v.type === "success") {
    color = 'rgb("#ceffc4")';
  } else if (v.type === "warning") {
    color = 'rgb("#fff3c4")';
  } else {
    color = 'rgb("#ffcbc4")';
  }
  s +=
    `#highlight(fill: ${color},bottom-edge: "descender", radius: 0.1em, extent: 0.2em)[#text(smallcaps[${v.type}])]  `;
  s += `\`${v.id}\`\n\n`;
  s += `#par(first-line-indent: 2em, hanging-indent:2em)[${v.message}]\n\n`;
  return s;
}

export function renderTypstErrorMessage(
  title: string,
  errorMessage: string,
): string {
  let s = "";
  s += `#set document(title: [${title}], author: "Smoke Cloud")\n\n`;
  s += `= ${title}\n\n`;
  s += `== Failed to Inspect Input File\n\n`;
  s += `While tring to analyse the input file the following error occurred:`;
  s += "```";
  s += errorMessage;
  s += "```";
  return s;
}
