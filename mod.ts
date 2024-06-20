import {
  type FdsFile,
  type InputSummary,
  type Resolution,
  summarise_input,
  type VerificationSummary,
  verifyInput,
} from "jsr:@smoke-cloud/fds-inspect-core@0.1.3";
import Handlebars from "npm:handlebars@4.7.8";
import {
  summaryTableHbs,
  verificationListHbs,
  verificationPageHbs,
  verificationTableHbs,
} from "./hbs.ts";

export async function getJson(path: string, cwd?: string): Promise<FdsFile> {
  let s;
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
    s = new TextDecoder().decode(output.stdout);
    return JSON.parse(s);
  } catch (e) {
    console.log(`input: '${s}'`);
    throw e;
  }
}

export function renderVerification(
  inputSummary: InputSummary,
  verificationSummary: VerificationSummary,
): string {
  Handlebars.registerHelper("renderCategory", renderCategory);
  Handlebars.registerHelper("categoryClass", categoryClass);
  Handlebars.registerHelper("renderResolution", renderResolution);
  Handlebars.registerHelper("renderHoC", renderHoC);
  Handlebars.registerHelper("renderHrr", renderHrr);
  Handlebars.registerHelper("renderSootProduction", renderSootProduction);
  Handlebars.registerHelper("renderInteger", renderInteger);
  Handlebars.registerHelper("renderFloat", renderFloat);

  Handlebars.registerPartial("verificationTable", verificationTableHbs);
  Handlebars.registerPartial("verificationList", verificationListHbs);
  Handlebars.registerPartial("summaryTable", summaryTableHbs);

  const template = Handlebars.compile(verificationPageHbs);

  function renderCategory(category: string): string | undefined {
    switch (category) {
      case "failure":
        return "[Failure]";
      case "warning":
        return "[Warning]";
      case "success":
        return "[Success]";
      default:
        break;
    }
  }

  function categoryClass(category: string): string | undefined {
    switch (category) {
      case "failure":
        return "shown-test";
      case "warning":
        return "shown-test";
      case "success":
        return "hidden-test";
      default:
        break;
    }
  }

  function renderResolution(resolution: Resolution): string | undefined {
    return `${resolution.dx.toFixed(3)}×${resolution.dy.toFixed(3)}×${
      resolution.dz.toFixed(3)
    } m`;
  }

  /** Render HoC as MJ/kg */
  function renderHoC(hoc: number): string {
    return (hoc / 1000 / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
  }

  /** Render HRR as kW */
  function renderHrr(hrr: number): string {
    return (hrr / 1000).toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  function renderSootProduction(sootProduction: number): string {
    return (sootProduction * 1000).toLocaleString("en-US", {
      minimumFractionDigits: 2,
    });
  }

  function renderInteger(i: number): string {
    return i.toLocaleString("en-US");
  }

  function renderFloat(i: number): string {
    return i.toLocaleString("en-US", { minimumFractionDigits: 2 });
  }

  return template({ inputSummary, verificationSummary });
}

export function verifyInputRender(fdsFile: FdsFile): string {
  const verificationSummary = verifyInput(fdsFile);
  const inputSummary = summarise_input(fdsFile);
  const rendered = renderVerification(inputSummary, verificationSummary);
  return rendered;
}
