import * as fdsInspectCore from "jsr:@smoke-cloud/fds-inspect-core@0.1.20";
import * as path from "jsr:@std/path@1.0.8";

export async function getJson(
  path: string,
  cwd?: string,
): Promise<
  { success: true; data: fdsInspectCore.FdsFile } | {
    success: false;
    error: string;
  }
> {
  let sOut;
  let sErr;
  try {
    const cmd = "fds-verify.cmd";
    const output: Deno.CommandOutput = await (new Deno.Command(cmd, {
      args: [
        path,
        "--json",
        "-",
      ],
      cwd,
    })).output();
    if (!output.success) {
      throw new Error(new TextDecoder().decode(output.stderr));
    }
    sOut = new TextDecoder().decode(output.stdout);
    sErr = new TextDecoder().decode(output.stderr);
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
): Promise<
  { success: true; data: fdsInspectCore.fds.FdsData } | {
    success: false;
    error: string;
  }
> {
  const tempDir = await Deno.makeTempDir();
  const fn = path.basename(inputPath);
  await Deno.copyFile(inputPath, path.join(tempDir, fn));
  const fdsData = await getJson(fn, tempDir);
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
    const cmd = Deno.build.os === "windows" ? "smvq.cmd" : "smvq";
    const cwd = dirPath ?? path.dirname(smvPath);
    const output: Deno.CommandOutput = await (new Deno.Command(cmd, {
      args: [
        smvPath,
      ],
      cwd,
    })).output();
    if (!output.success) {
      throw new Error(new TextDecoder().decode(output.stderr));
    }
    s = new TextDecoder().decode(output.stdout);
    const raw = JSON.parse(s);
    return new fdsInspectCore.smv.SmvData(cwd ?? ".", raw);
  } catch (e) {
    console.log(`input: '${s}'`);
    throw e;
  }
}

export async function renderTypstPdf(path: string, typstInput: string) {
  const cmd = new Deno.Command("typst", {
    args: ["compile", "-", path],
    stdin: "piped",
    stdout: "piped",
    stderr: "piped",
  });
  const child = cmd.spawn();
  {
    const writer = child.stdin.getWriter();
    await writer.write((new TextEncoder()).encode(typstInput));
    writer.close();
  }
  const output = await child.output();
  if (output.success) {
    const stdout = (new TextDecoder()).decode(output.stdout);
    console.log(stdout);
  } else {
    const stderr = (new TextDecoder()).decode(output.stderr);
    console.log(stderr);
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
    (inputSummary.heat_of_combustion / 1000 / 1000).toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } MJ/kg ],\n`;

  s += `  [Total Max. Soot Production],\n`;
  s += `  [${
    (inputSummary.total_soot_production * 1000).toLocaleString("en-US", {
      minimumSignificantDigits: 4,
      maximumSignificantDigits: 6,
    })
  } g/s ],\n`;

  s += `  [Non-Dimensionalised Ratios],\n`;
  s += `  [ ],\n`;

  s += `  [\\# Sprinklers],\n`;
  s += `  [${inputSummary.n_sprinklers}],\n`;

  s += `  [Sprinkler Activation Temperatures],\n`;
  s += `  [${
    inputSummary.sprinkler_activation_temperatures.map((c: number) =>
      c.toLocaleString("en-US", {
        minimumSignificantDigits: 4,
        maximumSignificantDigits: 6,
      }) + "°C"
    ).join("\n\n")
  }],\n`;

  s += `  [\\# Detectors],\n`;
  s += `  [${inputSummary.n_smoke_detectors}],\n`;

  s += `  [Smoke Detector Obscurations],\n`;
  s += `  [${
    inputSummary.smoke_detector_obscurations.map((c: number) =>
      c.toLocaleString("en-US", {
        minimumSignificantDigits: 4,
        maximumSignificantDigits: 6,
      }) + " %Obs/m"
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
    inputSummary.mesh_resolutions.map((c: fdsInspectCore.Resolution) =>
      `${c.dx.toFixed(3)}×${c.dy.toFixed(3)}×${c.dz.toFixed(3)} m`
    ).join("\n\n")
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
