import {
  countCells,
  type FdsFile,
  type Resolution,
  summarise_input,
  verifyInput,
} from "./../fds-inspect-core/mod.ts";
import * as path from "jsr:@std/path";
import Handlebars from "npm:handlebars";
import { Command } from "jsr:@cliffy/command@1.0.0-rc.4";
import { open } from "https://deno.land/x/open@v0.0.6/index.ts";
import {
  summaryTableHbs,
  verificationListHbs,
  verificationPageHbs,
  verificationTableHbs,
} from "./hbs.ts";

await new Command()
  .name("tway-server-manager")
  .description("A simple reverse proxy example cli.")
  .version("v1.0.0")
  // .option("-p, --port <port:number>", "The port number for the local server.", {
  //   default: 8080,
  // })
  // .option("--host <hostname>", "The host name for the local server.", {
  //   default: "localhost",
  // })
  // .arguments("[domain]")
  // .action(() => console.log("Main command called."))
  // Child command 1.
  .command("count-cells", "Count the total number of cells")
  // .option("-f, --foo", "Foo option.")
  .arguments("<input-path:string>")
  .action(async (_options, ...args) => {
    const fdsFile = await getJson(args[0]);
    const nCells = countCells(fdsFile);
    console.log(nCells);
  })
  // Get Threadway Send
  .command("meshes", "Display information on each mesh")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
    // // use fute_core::FdsFileExt;
    // use prettytable::{Attr, Cell, Row, Table};
    // // use fute_core::FdsFile;
    // // use fute_core::parse_and_decode_fds_input_file;
    // use num_format::{Locale, ToFormattedString};

    // let fds_file = parse_and_decode_fds_input_file(fds_path).unwrap();
    // let meshes = fds_file.mesh;
    // let mut table = Table::new();
    // table.set_titles(Row::new(vec![
    //     Cell::new("#").with_style(Attr::Bold),
    //     Cell::new("Mesh Id.").with_style(Attr::Bold),
    //     Cell::new("# Cells").with_style(Attr::Bold),
    //     Cell::new("I-J-K").with_style(Attr::Bold),
    //     Cell::new("Δx-Δy-Δz").with_style(Attr::Bold),
    //     Cell::new("Aspect Ratio").with_style(Attr::Bold),
    // ]));
    // let mut n_cells_total: u64 = 0;
    // for (i, mesh) in meshes.iter().enumerate() {
    //     let xb = mesh.xb;
    //     let ijk = mesh.ijk;
    //     let n_cell = Cell::new(&format!("{}", i + 1));
    //     let id_cell = Cell::new(mesh.id.as_ref().unwrap_or(&"Unnamed MESH".to_string()));
    //     let n_cells = ijk.i * ijk.j * ijk.k;
    //     let quantity_cell = Cell::new(&n_cells.to_formatted_string(&Locale::en));
    //     let ijk_cell = Cell::new(&format!("{}-{}-{}", ijk.i, ijk.j, ijk.k));
    //     let dx = (xb.x2 - xb.x1) / (ijk.i as f64);
    //     let dy = (xb.y2 - xb.y1) / (ijk.j as f64);
    //     let dz = (xb.z2 - xb.z1) / (ijk.k as f64);
    //     let dxyz_cell = Cell::new(&format!("{:.2}-{:.2}-{:.2}", dx, dy, dz));
    //     let max_dx = if dx >= dy && dx >= dz {
    //         dx
    //     } else if dy >= dz {
    //         dy
    //     } else {
    //         dz
    //     };
    //     let min_dx = if dx <= dy && dx <= dz {
    //         dx
    //     } else if dy <= dz {
    //         dy
    //     } else {
    //         dz
    //     };
    //     let aspect_ratio_cell = Cell::new(&format!("{:.2}", max_dx / min_dx));
    //     table.add_row(Row::new(vec![
    //         n_cell,
    //         id_cell,
    //         quantity_cell,
    //         ijk_cell,
    //         dxyz_cell,
    //         aspect_ratio_cell,
    //     ]));
    //     n_cells_total += n_cells as u64;
    // }
    // table.add_row(Row::new(vec![
    //     Cell::new("Total"),
    //     Cell::new(""),
    //     Cell::new(&n_cells_total.to_formatted_string(&Locale::en)),
    //     Cell::new(""),
    //     Cell::new(""),
    //     Cell::new(""),
    // ]));
    // table.printstd();
  })
  // Update Threadway Send
  .command("plot-hrr", "Plot the HRR")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  // Get Threadway
  .command("show-hrr", "Plot and show the HRR")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  // Get Aff-Docs
  .command("peak-hrr", "Print the highest HRR value from available data")
  .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("verify-input", "Copy input and relevant output files.")
  // .option("-f, --foo", "Foo option.")
  .arguments("<input-path:string>")
  .action(async (_options, ...args) => {
    await verifyInputShow(args[0]);
  })
  .command("copy-inputs", "Bar sub-command.")
  .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("verify", "Verify both the input and the output")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("rename", "Rename a simulation")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command(
    "compare",
    "Compare data vectors from multiple different simulations",
  )
  .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("new-rev", "Create a new revision of a simulation")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("current-progress", "Output the current progress of the simulation")
  .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("chart", "Compile a summary of information")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("read-out", "Read .out info")
  .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .command("hrr-vector", "Output HRR vector")
  // .option("--master", "Pull the master branch version.")
  .arguments("<input-path:string>")
  .action(async () => {
    // const fdsFile = await getJson(args[0]);
  })
  .parse(Deno.args);

async function getJson(path: string): Promise<FdsFile> {
  let s;
  try {
    const cmd = "fds-verify.cmd";
    const output: Deno.CommandOutput = await (new Deno.Command(cmd, {
      args: [
        path,
        "--json",
        "-",
      ],
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

async function verifyInputShow(inputPath: string) {
  const fdsFile: FdsFile = await getJson(inputPath);
  const res = verifyInput(fdsFile);
  const inputSummary = summarise_input(fdsFile);

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

  const p = path.dirname(inputPath);
  const htmlOutput = path.join(p, "Verification.html");
  await Deno.writeTextFile(
    htmlOutput,
    template({ inputSummary, verificationSummary: res }),
  );
  await open(htmlOutput);
}
