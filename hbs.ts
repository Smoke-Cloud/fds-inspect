export const summaryTableHbs = `<table class="summary-table">
    <thead>
        <tr>
            <th>
                General
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                CHID
            </td>
            <td>
                {{chid}}
            </td>
        </tr>
        <tr>
            <td>
                Simulation Time
            </td>
            <td>
                {{renderFloat simulation_length}} s
            </td>
        </tr>
    </tbody>

    <thead>
        <tr>
            <th>
                Fire
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                # Burners
            </td>
            <td>
                {{renderInteger n_burners}}
            </td>
        </tr>

        <tr>
            <td>
                Total Max. HRR
            </td>
            <td>
                {{renderHrr total_max_hrr}} kW
            </td>
        </tr>
        <tr>
            <td>
                Heat of Combustion
            </td>
            <td>
                {{renderHoC heat_of_combustion}} MJ/kg
            </td>
        </tr>
        <tr>
            <td>
                Total Max. Soot Production
            </td>
            <td>
                {{renderSootProduction total_soot_production}} g/s
            </td>
        </tr>
        <tr>
            <td>
                Non-Dimensionalised Ratios
            </td>
            <td>
                <ul>
                    {{#each ndrs}}
                    <li>
                        {{this}}
                    </li>
                    {{/each}}
                </ul>
            </td>
        </tr>
    </tbody>
    <thead>
        <tr>
            <th>
                Sprinklers
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                # Sprinklers
            </td>
            <td>
                {{renderInteger n_sprinklers}}
            </td>
        </tr>
        <tr>
            <td>
                Sprinkler Activation Temperatures
            </td>
            <td>
                <ul>
                    {{#each sprinkler_activation_temperatures}}
                    <li>
                        {{this}}°C
                    </li>
                    {{/each}}
                </ul>
            </td>
        </tr>
    </tbody>
    <thead>
        <tr>
            <th>
                Detection
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                # Detectors
            </td>
            <td>
                {{renderInteger n_smoke_detectors}}
            </td>
        </tr>
        <tr>
            <td>
                Smoke Detector Obscurations
            </td>
            <td>
                <ul>
                    {{#each smoke_detector_obscurations }}
                    <li>
                        {{this}} %Obs/m
                    </li>
                    {{/each}}
                </ul>
            </td>
        </tr>
    </tbody>
    <thead>
        <tr>
            <th>
                Ventilation
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                # Extracts
            </td>
            <td>
                {{renderInteger n_extract_vents}}
            </td>
        </tr>
        <tr>
            <td>
                Total Extract Rate
            </td>
            <td>
                <ul>
                    {{total_extract_rate}} m³/s
                </ul>
            </td>
        </tr>
        <tr>
            <td>
                # Supplies
            </td>
            <td>
                {{renderInteger n_supply_vents}}
            </td>
        </tr>
        <tr>
            <td>
                Total Supply Rate
            </td>
            <td>
                <ul>
                    {{total_supply_rate}} m³/s
                </ul>
            </td>
        </tr>
    </tbody>
    <thead>
        <tr>
            <th>
                Domain
            </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                # Meshes
            </td>
            <td>
                {{renderInteger n_meshes}}
            </td>
        <tr>
            <td>
                # Cells
            </td>
            <td>
                {{renderInteger n_cells}}
            </td>
        </tr>
        <tr>
            <td>
                Mesh Resolutions
            </td>
            <td>
                <ul>
                    {{#each mesh_resolutions }}
                    <li>
                        {{renderResolution this}}
                    </li>
                    {{/each}}
                </ul>
            </td>
        </tr>
        </tr>
    </tbody>
</table>
`;
export const verificationListHbs = `<ul class="verification-list">
    {{#each value }}
    <li class="{{type}}Test test {{categoryClass type}}" onclick="toggle_visibility(arguments[0],this);">
        {{> verificationTable this}}
    </li>
    {{/each}}
</ul>
`;
export const verificationPageHbs = `<html>

<head>
    <style>
        ul {
            list-style-type: none;
            padding: 0px;
            margin-left: 15px;
        }

        .successTest {
            background-color: hsl(120, 100%, 75%);
        }

        .successTest:hover,
        .successTest:active {
            background-color: hsl(120, 100%, 50%);
        }

        .warningTest {
            background-color: hsl(40, 100%, 75%);
        }

        .warningTest:hover,
        .warningTest:active {
            background-color: hsl(40, 100%, 50%);
        }

        .failureTest {
            background-color: hsl(0, 100%, 75%);
        }

        .failureTest:hover,
        .failureTest:active {
            background-color: hsl(0, 100%, 60%);
        }

        span.success {
            color: limegreen;
        }

        span.warning {
            color: orange;
        }

        span.failure {
            color: red;
        }

        .hidden-test>ul {
            display: none;
        }

        .hidden-test>div>ul {
            display: none;
        }

        .shown-test>ul {
            display: block;
        }

        .shown-test>div>ul {
            display: block;
        }

        .summary-table {
            /*   display: inline-block;
vertical-align: top; */
        }

        .verification-list {
            vertical-align: top;
            display: inline-block;
        }

        .summary-div {
            vertical-align: top;
            display: inline-block;
        }

        table a:link {
            color: #666;
            font-weight: bold;
            text-decoration: none;
        }

        table a:visited {
            color: #999999;
            font-weight: bold;
            text-decoration: none;
        }

        table a:active,
        table a:hover {
            color: #bd5a35;
            text-decoration: underline;
        }

        table {
            font-family: Arial, Helvetica, sans-serif;
            color: #666;
            font-size: 12px;
            text-shadow: 1px 1px 0px #fff;
            background: #eaebec;
            margin: 20px;
            border: #ccc 1px solid;
            -moz-border-radius: 3px;
            -webkit-border-radius: 3px;
            border-radius: 3px;
            -moz-box-shadow: 0 1px 2px #d1d1d1;
            -webkit-box-shadow: 0 1px 2px #d1d1d1;
            box-shadow: 0 1px 2px #d1d1d1;
            display: inline-block;
        }

        table th {
            padding: 5px 5px 5px 5px;
            border-top: 1px solid #fafafa;
            border-bottom: 1px solid #e0e0e0;
            background: #ededed;
            background: -webkit-gradient(linear,
                    left top,
                    left bottom,
                    from(#ededed),
                    to(#ebebeb));
            background: -moz-linear-gradient(top, #ededed, #ebebeb);
        }

        table th:first-child {
            text-align: left;
            padding-left: 20px;
        }

        table tr:first-child th:first-child {
            -moz-border-radius-topleft: 3px;
            -webkit-border-top-left-radius: 3px;
            border-top-left-radius: 3px;
        }

        table tr:first-child th:last-child {
            -moz-border-radius-topright: 3px;
            -webkit-border-top-right-radius: 3px;
            border-top-right-radius: 3px;
        }

        table tr {
            text-align: center;
            padding-left: 20px;
        }

        table td:first-child {
            text-align: left;
            padding-left: 20px;
            border-left: 0;
        }

        table td {
            padding: 5px;
            border-top: 1px solid #ffffff;
            border-bottom: 1px solid #e0e0e0;
            border-left: 1px solid #e0e0e0;
            background: #fafafa;
            background: -webkit-gradient(linear,
                    left top,
                    left bottom,
                    from(#fbfbfb),
                    to(#fafafa));
            background: -moz-linear-gradient(top, #fbfbfb, #fafafa);
        }

        table tr.even td {
            background: #f6f6f6;
            background: -webkit-gradient(linear,
                    left top,
                    left bottom,
                    from(#f8f8f8),
                    to(#f6f6f6));
            background: -moz-linear-gradient(top, #f8f8f8, #f6f6f6);
        }

        table tr:last-child td {
            border-bottom: 0;
        }

        table tr:last-child td:first-child {
            -moz-border-radius-bottomleft: 3px;
            -webkit-border-bottom-left-radius: 3px;
            border-bottom-left-radius: 3px;
        }

        table tr:last-child td:last-child {
            -moz-border-radius-bottomright: 3px;
            -webkit-border-bottom-right-radius: 3px;
            border-bottom-right-radius: 3px;
        }

        table tr:hover td {
            background: #f2f2f2;
            background: -webkit-gradient(linear,
                    left top,
                    left bottom,
                    from(#f2f2f2),
                    to(#f0f0f0));
            background: -moz-linear-gradient(top, #f2f2f2, #f0f0f0);
        }

        @media print {
            .hidden-test>ul {
                display: block;
            }

            .hidden-test>div>ul {
                display: block;
            }

            .verification-list {
                vertical-align: initial;
                display: initial;
            }

            .summary-div {
                vertical-align: initial;
                display: initial;
            }

            table,
            th,
            td,
            tr,
            thead,
            tbody {
                border-collapse: collapse;
                /*     border: 1px solid black; */
                background: none;
                border-radius: 0;
                /*     width:100%; */
                /*     text-align:right; */
            }

            table tr:first-child th:first-child {
                border-top-left-radius: 0px;
            }

            table tr:first-child th:last-child {
                border-top-right-radius: 0px;
            }

            table tr:last-child td {
                border-bottom: 0;
            }

            table tr:last-child td:first-child {
                border-bottom-left-radius: 0px;
            }

            table tr:last-child td:last-child {
                border-bottom-right-radius: 0px;
            }
        }
    </style>
    <script type="text/javascript">
        function toggle_visibility(ev, el) {
            if (el.classList.contains("test")) {
                el.classList.toggle("shown-test");
                el.classList.toggle("hidden-test");
                ev.stopPropagation();
            };
        }
    </script>
</head>

<body>
    <h1>{{inputSummary.chid}} </h1>
    {{> summaryTable inputSummary}}
    {{#if verificationSummary.result}}
    {{> verificationList verificationSummary.result}}
    {{/if}}
</body>

</html>
`;
export const verificationTableHbs = `{{#if value.message}}
<div>
    <strong>
        {{name}}
    </strong>
    <span class="{{type}}">
        {{renderCategory type}}</span>:
    {{value.message}}
</div>
{{else}}
<div>
    <strong>
        {{name}}
    </strong><span class="{{type}}">
        {{renderCategory type}}</span>:
</div>
{{> verificationList this}}
{{/if}}
`;
