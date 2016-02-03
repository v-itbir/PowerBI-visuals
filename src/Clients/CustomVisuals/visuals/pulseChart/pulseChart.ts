/*
*  Power BI Visualizations
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved. 
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*   
*  The above copyright notice and this permission notice shall be included in 
*  all copies or substantial portions of the Software.
*   
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/

// /// <reference path="../../_references.ts"/>

module powerbi.visuals.samples {
    import SelectionManager = utility.SelectionManager;
    import ClassAndSelector = jsCommon.CssConstants.ClassAndSelector;
    import createClassAndSelector = jsCommon.CssConstants.createClassAndSelector;
    import AxisScale = powerbi.visuals.axisScale;

    export interface PulseChartConstructorOptions {
        animator?: IGenericAnimator;
        svg?: D3.Selection;
        behavior?: IInteractiveBehavior;
    }

    export interface PulseChartBehaviorOptions {
        layerOptions?: any[];
        clearCatcher: D3.Selection;
    }

    export interface TooltipSettings {
        dataPointColor: string;
        marginTop: number;
        height: number;
        timeWidth: number;
        timeHeight: number;
    }

    export interface PulseChartSeries extends LineChartSeries {
        name?: string;
        data: PulseChartDataPoint[];
        color: string;
        identity: SelectionId;
        width: number;
        xAxis?: D3.Svg.Axis;
    }

    export interface PulseChartTooltipData {
        time: string;
        title: string;
        description: string;
    }


    export interface PulseChartDataPoint extends LineChartDataPoint {
        y?: number;
        popupInfo?: PulseChartTooltipData;
    }

    export interface PulseChartLegend extends DataViewObject {
        show?: boolean;
        showTitle?: boolean;
        titleText?: string;
        position?: LegendPosition;
    }

    export interface PulseChartPopup {
        showType: string;
        width: number;
        color: string
        fontSize: number;
        fontColor: string;
        showTime: boolean;
        timeColor: string;
        timeFill: string;
    }

    module PulseChartPopupShow {
        export var HIDE: string = 'Hide';
        export var SELECTED: string = 'Selected';
        export var ALWAYS: string = 'Always';

        export var type: IEnumType = createEnumType([
            { value: HIDE, displayName: PulseChartPopupShow.HIDE },
            { value: SELECTED, displayName: PulseChartPopupShow.SELECTED },
            { value: ALWAYS, displayName: PulseChartPopupShow.ALWAYS },
        ]);
    }

    export interface PulseChartSeriesSetting {
        fill: string;
        width: number;
        showByDefault: boolean;
    }

    export interface PulseChartPlaybackSetting {
        pauseDuration: number;
        autoplay: boolean;
        autoplayPauseDuration: number;
    }

    export interface PulseChartXAxisSettings {
        show: boolean;
        step: number;
    }

    export interface PulseChartSettings {
        displayName?: string;
        fillColor?: string;
        precision: number;
        legend?: PulseChartLegend;
        colors?: IColorPalette;
        series: PulseChartSeriesSetting;
        popup: PulseChartPopup;
        xAxis: PulseChartXAxisSettings;
        playback: PulseChartPlaybackSetting;
    }

    export interface PulseChartData {
        categoryMetadata: DataViewMetadataColumn;
        hasHighlights?: boolean;

        series: PulseChartSeries[];
        isScalar?: boolean;
        dataLabelsSettings: PointDataLabelsSettings;
        axesLabels: ChartAxesLabels;
        hasDynamicSeries?: boolean;
        defaultSeriesColor?: string;
        categoryData?: LineChartCategoriesData[];

        categories: any[];
        legendData?: LegendData;
        xScale?: IAxisProperties;
        xAxisProperties?: IAxisProperties;
        yAxisProperties?: IAxisProperties;
        settings?: PulseChartSettings;
        formatter?: IValueFormatter;
    }

    interface PulseChartProperty {
        [propertyName: string]: DataViewObjectPropertyIdentifier;
    }

    interface PulseChartProperties {
        [objectName: string]: PulseChartProperty;
    }

    interface PulseChartXAxisProperties {
        dates: Date[];
        scale: D3.Scale.TimeScale;
        formatter: IValueFormatter;
    }

    interface PulseChartPoint {
        x: number;
        value: Date;
    }

    export class PulseChart implements IVisual {

        public static RoleNames = {
            Timestamp: "Timestamp",
            Category: "Category",
            Value: "Value",
            EventTitle: "EventTitle",
            EventDescription: "EventDescription",
        };

        public static capabilities: VisualCapabilities = {
            dataRoles: [
                {
                    displayName: PulseChart.RoleNames.Timestamp,
                    name: PulseChart.RoleNames.Timestamp,
                    kind: powerbi.VisualDataRoleKind.Grouping,
                },
                {
                    displayName: PulseChart.RoleNames.Value,
                    name: PulseChart.RoleNames.Value,
                    kind: powerbi.VisualDataRoleKind.Measure,
                },
                {
                    displayName: PulseChart.RoleNames.Category,
                    name: PulseChart.RoleNames.Category,
                    kind: powerbi.VisualDataRoleKind.Grouping,
                },
                {
                    displayName: PulseChart.RoleNames.EventTitle,
                    name: PulseChart.RoleNames.EventTitle,
                    kind: powerbi.VisualDataRoleKind.GroupingOrMeasure,
                },
                {
                    displayName: PulseChart.RoleNames.EventDescription,
                    name: PulseChart.RoleNames.EventDescription,
                    kind: powerbi.VisualDataRoleKind.GroupingOrMeasure,
                },
            ],
            dataViewMappings: [{
                conditions: [
                    {
                        'Timestamp': { min: 1, max: 1 },
                        'Value': { max: 0 },
                        'Category': { max: 0 },
                        'EventTitle': { max: 0 },
                        'EventDescription': { max: 0 },
                    },
                    {
                        'Timestamp': { min: 1, max: 1 },
                        'Value': { min: 1, max: 1 },
                        'Category': { max: 0 },
                        'EventTitle': { max: 0 },
                        'EventDescription': { max: 0 },
                    },
                    {
                        'Timestamp': { min: 1, max: 1 },
                        'Value': { min: 1, max: 1 },
                        'Category': { max: 1 },
                        'EventTitle': { max: 1 },
                        'EventDescription': { max: 1 },
                    }
                ],
                categorical: {
                    categories: {
                        for: { in: PulseChart.RoleNames.Timestamp }
                    },
                    values: {
                        group: {
                            by: PulseChart.RoleNames.Category,
                            select: [
                                { bind: { to: PulseChart.RoleNames.Value } },
                                { bind: { to: PulseChart.RoleNames.EventTitle } },
                                { bind: { to: PulseChart.RoleNames.EventDescription } }
                            ]
                        },
                    },
                },
            }],
            objects: {
                series: {
                    displayName: "Series",
                    description: "Series",
                    properties: {
                        fill: {
                            displayName: data.createDisplayNameGetter('Visual_Fill'),
                            type: { 
                                fill: { 
                                    solid: { 
                                        color: true
                                    }
                                }
                            }
                        },
                        width: {
                            displayName: 'Width',
                            type: { 
                                numeric: true
                            }
                        },
                        showByDefault: {
                            displayName: 'Show by default',
                            type: { 
                                bool: true
                            }
                        },
                    }
                },
                general: {
                    displayName: 'General',
                    properties: {
                        formatString: { type: { formatting: { formatString: true } } },
                        fill: {
                            displayName: 'Background color',
                            type: { fill: { solid: { color: true } } }
                        }
                    }
                },
                popup: {
                    displayName: 'Popup',
                    properties: {
                        showType: {
                            displayName: "Show",
                            type: { enumeration: PulseChartPopupShow.type }
                        },
                        width: {
                            displayName: 'Width',
                            type: { 
                                numeric: true
                            }
                        },
                        color: {
                            displayName: data.createDisplayNameGetter('Visual_Fill'),
                            type: { fill: { solid: { color: true } } }
                        },
                        fontSize: {
                            displayName: "Text size",
                            type: { formatting: { fontSize: true } }
                        },
                        fontColor: {
                            displayName: "Text color",
                            type: { fill: { solid: { color: true } } }
                        },
                        showTime: {
                            displayName: 'Show time',
                            type: { bool: true }
                        },
                        timeColor: {
                            displayName: "Time color",
                            type: { fill: { solid: { color: true } } }
                        },
                        timeFill: {
                            displayName: "Time fill",
                            type: { fill: { solid: { color: true } } }
                        },
                    }
                },
                xAxis: {
                    displayName: data.createDisplayNameGetter('Visual_XAxis'),
                    properties: {
                        show: {
                            displayName: data.createDisplayNameGetter("Visual_Show"),
                            type: { bool: true }
                        },
                        step: {
                            displayName: "Step In Minutes",
                            type: { numeric: true }
                        }
                    }
                },
                playback: {
                    displayName: 'Playback',
                    properties: {
                        autoplay: {
                            displayName: "Autoplay",
                            type: { bool: true }
                        },
                        pauseDuration: {
                            displayName: "Pause Duration",
                            type: { numeric: true }
                        },
                        autoplayPauseDuration: {
                            displayName: "Autoplay Pause Duration",
                            type: { numeric: true }
                        },
                    }
                },
            }
        }; 

        private static Properties: PulseChartProperties = {
            general: {
                formatString: {
                    objectName: "general",
                    propertyName: "formatString"
                }
            },
            legend: {
                show: { objectName: 'legend', propertyName: 'show' },
                position: { objectName: 'legend', propertyName: 'position' },
                showTitle: { objectName: 'legend', propertyName: 'showTitle' },
                titleText: { objectName: 'legend', propertyName: 'titleText' },
            },
            series: {
                fill: { objectName: 'series', propertyName: 'fill' },
                width: { objectName: 'series', propertyName: 'width' },
                showByDefault: { objectName: 'series', propertyName: 'showByDefault' },
            },
            labels: {
                labelPrecision: {
                    objectName: "labels",
                    propertyName: "labelPrecision"
                }
            },
            popup: {
                showType: {
                    objectName: "popup",
                    propertyName: "showType"
                },
                width: {
                    objectName: "popup",
                    propertyName: "width"
                },
                color: {
                    objectName: "popup",
                    propertyName: "color"
                },
                fontSize: {
                    objectName: "popup",
                    propertyName: "fontSize"
                },
                fontColor: {
                    objectName: "popup",
                    propertyName: "fontColor"
                },
                showTime: { 
                    objectName: 'popup', 
                    propertyName: 'showTime' 
                },
                timeColor: {
                    objectName: "popup",
                    propertyName: "timeColor"
                },
                timeFill: {
                    objectName: "popup",
                    propertyName: "timeFill"
                }
            },
            xAxis: {
                show: {
                    objectName: "xAxis",
                    propertyName: "show"
                },
                step: {
                    objectName: "xAxis",
                    propertyName: "step"
                }
            },
            playback: {
                autoplay: { 
                    objectName: "playback",
                    propertyName: "autoplay"
                },
                pauseDuration: {
                    objectName: "playback",
                    propertyName: "pauseDuration"
                },
                autoplayPauseDuration: {
                    objectName: "playback",
                    propertyName: "autoplayPauseDuration"
                },
            },
        };

        private static DefaultSettings: PulseChartSettings = {
            precision: 0,
            popup: {
                showType: PulseChartPopupShow.ALWAYS,
                width: 100,
                color: "#808181",
                fontSize: 10,
                fontColor: 'white',
                showTime: true,
                timeColor: 'white',
                timeFill: '#010101', 
            },
            series: {
                fill: "#3779B7",
                width: 2,
                showByDefault: true
            },
            xAxis: {
                step: 30,
                show: true
            },
            playback: {
                autoplay: true,
                pauseDuration: 10,
                autoplayPauseDuration: 0
            }
        };

        private static DefaultFontFamily = 'cursive';
        private static DefaultFontColor = 'rgb(165, 172, 175)';
        private static DefaultBackgroundColor = '#243C18';
        private static DefaultFormatString: string = "%H:mm";
        private static PaddingBetweenText = 15;
        private static MaxWidthOfLabel: number = 40;
        private static ShiftCategoryIndex: number = 8;

        private svg: D3.Selection;
        private chart: D3.Selection;
        private xAxis: D3.Selection;
        private yAxis: D3.Selection;
        private gaps: D3.Selection;

        private animationPlay: D3.Selection;
        private animationPause: D3.Selection;

        private data: PulseChartData;

        private isFirstTime: boolean = true;

        private yDomain: number[] = [];

        private selectionManager: SelectionManager;
        private animator: IGenericAnimator;
        private behavior: IInteractiveBehavior;
        private colors: IDataColorPalette;

        private viewport: IViewport;
        private margin: IMargin;

        private static DefaultMargin: IMargin = {
            top: 100,
            bottom: 100,
            right: 45,
            left: 45,
        };

        private static DefaultViewport: IViewport = {
            width: 50,
            height: 50
        };

        private static DefaultTooltipSettings: TooltipSettings = {
            dataPointColor: "#808181",
            marginTop: 20,
            height: 64,
            timeWidth: 35,
            timeHeight: 15,
        }

        private static MinInterval = 60 * 1000;

        private scaleType: string = AxisScale.linear;

        private static Chart: ClassAndSelector = createClassAndSelector('chart');
        private static Line: ClassAndSelector  = createClassAndSelector('line');
        private static Lines: ClassAndSelector = createClassAndSelector('lines');
        private static Node: ClassAndSelector  = createClassAndSelector('node');
        private static LineNode: ClassAndSelector = createClassAndSelector('lineNode');
        private static Axis: ClassAndSelector = createClassAndSelector('axis');
        private static AxisNode: ClassAndSelector = createClassAndSelector('axisNode');
        private static Dot: ClassAndSelector  = createClassAndSelector('dot');
        private static Dots: ClassAndSelector = createClassAndSelector('dots');
        private static Tooltip: ClassAndSelector = createClassAndSelector('Tooltip');
        private static TooltipRect: ClassAndSelector = createClassAndSelector('tooltipRect');
        private static TooltipTriangle: ClassAndSelector = createClassAndSelector('tooltipTriangle');
        private static Gaps: ClassAndSelector = createClassAndSelector("gaps");
        private static Gap: ClassAndSelector = createClassAndSelector("gap");
        private static GapNode: ClassAndSelector = createClassAndSelector("gapNode");
        private static TooltipLine: ClassAndSelector = createClassAndSelector('tooltipLine');
        private static TooltipTime: ClassAndSelector = createClassAndSelector('tooltipTime');
        private static TooltipTimeRect: ClassAndSelector = createClassAndSelector('tooltipTimeRect');
        private static TooltipTitle: ClassAndSelector = createClassAndSelector('tooltipTitle');
        private static TooltipDescription: ClassAndSelector = createClassAndSelector('tooltipDescription');


        private static AnimationPlay: ClassAndSelector = createClassAndSelector('animationPlay');
        private static AnimationPause: ClassAndSelector = createClassAndSelector('animationPause');

        public constructor(options?: PulseChartConstructorOptions) {
            if (options) {
                if (options.svg) {
                    this.svg = options.svg;
                }
                if (options.animator) {
                    this.animator = options.animator;
                }
                if (options.behavior) {
                    this.behavior = options.behavior;
                }
            } else {
                this.behavior = new PulseChartBehavior([new ColumnChartWebBehavior()]);
            }

            this.margin = PulseChart.DefaultMargin;
        }

        private static getMeasureIndexOfRole(categories: DataViewCategoryColumn[], roleName: string): number {
          for (var i = 0; i < categories.length; i++) {
              if (categories[i].source &&
                  categories[i].source.roles &&
                  categories[i].source.roles[roleName]) {
                  return i;
              }
          }

          return -1;
        }

        public converter(dataView: DataView,
                                isScalar: boolean,
                                interactivityService?: IInteractivityService): PulseChartData {

            if (!dataView.categorical || !dataView.categorical.categories) {
                console.error("dataView.categorical.categories not found");
                return null;
            }

            var categories: DataViewCategoryColumn[] = dataView.categorical.categories;
            var settings: PulseChartSettings = this.parseSettings(dataView);
            var categoryMeasureIndex = PulseChart.getMeasureIndexOfRole(categories, PulseChart.RoleNames.Timestamp);
            var eventTitleMeasureIndex = PulseChart.getMeasureIndexOfRole(categories, PulseChart.RoleNames.EventTitle);
            var eventDescriptionMeasureIndex = PulseChart.getMeasureIndexOfRole(categories, PulseChart.RoleNames.EventDescription);
        
            if (categoryMeasureIndex < 0) {
                console.error("categoryMeasureIndex not found");
                return null;
            }

            var category: DataViewCategoryColumn = dataView.categorical.categories[categoryMeasureIndex];
            if (!category) {                
                console.error("dataView.categorical.categories[categoryMeasureIndex] not found");
                return null;
            }
            
            var categoryValues: any[] = category.values;
            
            if (!categoryValues || _.isEmpty(dataView.categorical.values)) {
                return null;
            }
            
            var eventTitleValues: any[] = [];
            if (eventTitleMeasureIndex >= 0) {
                eventTitleValues = dataView.categorical.categories[eventTitleMeasureIndex].values;
            }
            
            var eventDescriptionValues: any[] = [];
            if (eventDescriptionMeasureIndex >= 0) {
                eventDescriptionValues = dataView.categorical.categories[eventDescriptionMeasureIndex].values;
            }

            var xAxisCardProperties: DataViewObject = CartesianHelper.getCategoryAxisProperties(dataView.metadata);
            isScalar = CartesianHelper.isScalar(isScalar, xAxisCardProperties);
            categorical = ColumnUtil.applyUserMinMax(isScalar, categorical, xAxisCardProperties);

            var formatStringProp = PulseChart.Properties["general"]["formatString"];
            var categoryType: ValueType = AxisHelper.getCategoryValueType(category.source, isScalar);
            var isDateTime = AxisHelper.isDateTime(categoryType);
            //var categoryValues: any[] = category.values;
            var series: PulseChartSeries[] = [];
            var seriesLen = category.values ? category.values.length : 0;
            var hasDynamicSeries = !!(category.values && category.source);
            //var values: DataViewValueColumns = categorical.values;
            var values = dataView.categorical.categories;
            var labelFormatString: string = values && values[0] ? valueFormatter.getFormatString(values[0].source, formatStringProp) : undefined;
            var defaultLabelSettings: LineChartDataLabelsSettings = dataLabelUtils.getDefaultLineChartLabelSettings();

            var defaultSeriesColor: string;

            if (dataView.metadata && dataView.metadata.objects) {
                var objects = dataView.metadata.objects;
                defaultSeriesColor = DataViewObjects.getFillColor(objects, lineChartProps.dataPoint.defaultColor);

                //var labelsObj = <DataLabelObject>objects['labels'];
                //dataLabelUtils.updateLabelSettingsFromLabelsObject(labelsObj, defaultLabelSettings);
            }

            //var colorHelper = new ColorHelper(colors, lineChartProps.dataPoint.fill, defaultSeriesColor);

            var grouped: DataViewValueColumnGroup[];
            if (dataView.categorical.values) {
                grouped = dataView.categorical.values.grouped();
                //console.log("grouped", grouped);
            }

            var valueMeasureIndex = 0;//DataRoleHelper.getMeasureIndexOfRole(grouped, PulseChart.RoleNames.Value);

            if (valueMeasureIndex < 0) {
                console.error("valueMeasureIndex < 0");
                //return;
            }

            seriesLen = 1;//grouped.length;
            //console.log("seriesLen", seriesLen);
            
            var seriesIndex: number = 0; 
            var lastValue = null;
            
            //for (var seriesIndex = 0; seriesIndex < seriesLen; seriesIndex++) {
            
                var column = category;//categorical.values[seriesIndex];
                var valuesMetadata = column.source;
                var dataPoints: PulseChartDataPoint[] = [];
                var groupedIdentity = grouped[seriesIndex];
                
               //console.log("groupedIdentity", groupedIdentity);
               /*
                var identity = hasDynamicSeries && groupedIdentity ?
                    SelectionId.createWithIdAndMeasure(groupedIdentity.identity, column.source.queryName) :
                    SelectionId.createWithMeasure(column.source.queryName);
                    */
                
                var color = settings.series.fill;
                var width: number = settings.series.width;
                var seriesLabelSettings: LineChartDataLabelsSettings;

                if (!hasDynamicSeries) {
                    var labelsSeriesGroup = grouped && grouped.length > 0 && grouped[0].values ? grouped[0].values[seriesIndex] : null;
                    var labelObjects = (labelsSeriesGroup && labelsSeriesGroup.source && labelsSeriesGroup.source.objects) ? <DataLabelObject> labelsSeriesGroup.source.objects['labels'] : null;
                    if (labelObjects) {
                        //seriesLabelSettings = Prototype.inherit(defaultLabelSettings);
                        //dataLabelUtils.updateLabelSettingsFromLabelsObject(labelObjects, seriesLabelSettings);
                    }
                }

                var dataPointLabelSettings = (seriesLabelSettings) ? seriesLabelSettings : defaultLabelSettings;

                for (var fakeCategoryIndex = 0, categoryIndex = 0, seriesCategoryIndex = 0, len = column.values.length; categoryIndex < len; fakeCategoryIndex++, categoryIndex++, seriesCategoryIndex++) {
                    var categoryValue = categoryValues[categoryIndex];
                    var value = AxisHelper.normalizeNonFiniteNumber(column.values[categoryIndex]);

                    var identity = SelectionIdBuilder.builder()
                        .withCategory(column, categoryIndex)
                        .createSelectionId();

                    var key = identity.getKey();
                    var isGap: boolean = PulseChart.isGap(categoryValue, lastValue, isDateTime);

                    if (isGap &&  dataPoints.length > 0) {
                        series.push({
                            displayName: grouped[seriesIndex].name,
                            key: key,
                            lineIndex: seriesIndex,
                            color: color,
                            xCol: category.source,
                            yCol: column.source,
                            data: dataPoints,
                            identity: identity,
                            selected: false,
                            labelSettings: seriesLabelSettings,
                            width: width
                        });
                        seriesCategoryIndex = 0;
                        fakeCategoryIndex += PulseChart.ShiftCategoryIndex;
                        dataPoints = [];
                    }

                    lastValue = categoryValue;

                    // When Scalar, skip null categories and null values so we draw connected lines and never draw isolated dots.
                    if (isScalar && (categoryValue === null || value === null)) {
                        continue;
                    }

                    var categorical: DataViewCategorical = dataView.categorical;
                    var y0_group = groupedIdentity.values[valueMeasureIndex];
                    //console.log('y0_group', y0_group);
                    //var y1_group = groupedIdentity.values[valueMeasureIndex];

                    var y0 = y0_group.values[categoryIndex];
                    //var y1 = y1_group.values[categoryIndex];
                    ////console.log('y0', y0);
                    
                    if (y0 === null) {
                        y0_group = grouped[1].values[valueMeasureIndex];
                        y0 = y0_group.values[categoryIndex];
                    }
                    
                    //console.log('y0', y0);

                    var formatterLarge = valueFormatter.create({ format: "0", value: 1e6 });
                    var formatted_y0 = (y0 != null ? (String(y0).length >= 6 ? formatterLarge.format(y0) : y0) : y0);
               
                    var seriesData: TooltipSeriesDataItem[] = [
                        {
                            value: formatted_y0,
                            metadata: y0_group
                        },
                     /*   {
                            value: formatted_y1,
                            metadata: y1_group
                        }*/];

                    if (typeof(categorical.categories) === 'undefined') {
                        return;
                    }
                    var categoryColumns: DataViewCategoryColumn[] = [
                        categorical.categories[0]
                    ];
                    var tooltipInfo: TooltipDataItem[] = null;
                    var popupInfo: PulseChartTooltipData = null;                    
                    
                    if (eventTitleValues[categoryIndex] ||
                        eventDescriptionValues[categoryIndex]) {
                           //tooltipInfo = TooltipBuilder.createTooltipInfo(formatStringProp, null /*categorical*/, categoryValue, null, categoryColumns, seriesData, null);                                          
                         
                         var time = categoryValue;
                         
                         if (isDateTime && categoryValue) {
                            var formatterTime = valueFormatter.create({ format: "hh:mm"});
                            time = formatterTime.format(categoryValue);
                         }                         
                         
                         popupInfo = {
                             time: time,
                             title: eventTitleValues[categoryIndex],
                             description: eventDescriptionValues[categoryIndex]
                         };
                        }

                    var dataPoint: PulseChartDataPoint = {
                        categoryValue: isDateTime && categoryValue ? categoryValue : categoryValue,
                        value: value,
                        categoryIndex: fakeCategoryIndex,//categoryIndex,
                        seriesIndex: seriesIndex,
                        tooltipInfo: null,//tooltipInfo,
                        popupInfo: popupInfo,
                        selected: false,
                        identity: identity,
                        key: JSON.stringify({ ser: key, catIdx: categoryIndex }),
                        labelFill: dataPointLabelSettings.labelColor,
                        labelFormatString: labelFormatString || valuesMetadata.format,
                        labelSettings: dataPointLabelSettings,
                        y: y0,
                        pointColor: color,
                    };

                    dataPoints.push(dataPoint);
                }

                if (interactivityService) {
                    interactivityService.applySelectionStateToData(dataPoints);
                }

                if (dataPoints.length > 0) {
                    series.push({
                        displayName: grouped[seriesIndex].name,
                        key: key,
                        lineIndex: seriesIndex,
                        color: color,
                        xCol: category.source,
                        yCol: column.source,
                        data: dataPoints,
                        identity: identity,
                        selected: false,
                        labelSettings: seriesLabelSettings,
                        width: width
                    });
                }
           // }

            xAxisCardProperties = CartesianHelper.getCategoryAxisProperties(dataView.metadata);
            var valueAxisProperties = CartesianHelper.getValueAxisProperties(dataView.metadata);
             
            // Convert to DataViewMetadataColumn
            var valuesMetadataArray: powerbi.DataViewMetadataColumn[] = [];
            if (values) {
                for (var i = 0; i < values.length; i++) {

                    if (values[i] && values[i].source && values[i].source.displayName) {
                        valuesMetadataArray.push({ displayName: values[i].source.displayName });
                    }
                }
            }

            var axesLabels = converterHelper.createAxesLabels(xAxisCardProperties, valueAxisProperties, category.source, valuesMetadataArray);
            if (interactivityService) {
                interactivityService.applySelectionStateToData(series);
            }

            return {
                series: series,
                isScalar: isScalar,
                dataLabelsSettings: defaultLabelSettings,
                axesLabels: { x: axesLabels.xAxisLabel, y: axesLabels.yAxisLabel },
                hasDynamicSeries: hasDynamicSeries,
                categoryMetadata: category.source,
                categories: categoryValues,
                settings: settings
            };
        }

        private static isGap(newValue, oldValue, isDate) {
            if (!newValue ||
                !oldValue) {
                    return false;
                }
            if (!isDate) {
                return ((newValue - oldValue) > 1);
            } else {
                var oldDate = oldValue.getTime();
                var newDate = newValue.getTime();
                
                return ((newDate - oldDate) > PulseChart.MinInterval);
            }
        }

        public init(options: VisualInitOptions): void {
            this.selectionManager = new SelectionManager({ hostServices: options.host });
            var svg: D3.Selection = this.svg = d3.select(options.element.get(0))
                .append('svg')
                .classed('pulseChart', true);

            this.gaps = svg.append('g').classed(PulseChart.Gaps.class, true);
            this.chart = svg.append('g').attr('class', PulseChart.Chart.class);
            this.xAxis = svg.append('g').attr('class', 'x axis');
            this.yAxis = svg.append('g').attr('class', 'y axis');

            this.animationPlay = svg.append('g').classed(PulseChart.AnimationPlay.class, true).append("path");
            this.animationPause = svg.append('g').classed(PulseChart.AnimationPause.class, true).append("path");

            var style: IVisualStyle = options.style;

            this.colors = style && style.colorPalette
                ? style.colorPalette.dataColors
                : new DataColorPalette();
        }

        public update(options: VisualUpdateOptions): void {
            if (!options ||
                !options.dataViews ||
                !options.dataViews[0] ||
                !options.dataViews[0].categorical ||
                !options.dataViews[0].categorical.values ||
                !options.dataViews[0].categorical.values[0] ||
                !options.dataViews[0].categorical.values[0].values) {
                    this.clear();
                    return;
            }

            var dataView: DataView = options.dataViews[0],
                categoryType: ValueType = ValueType.fromDescriptor({ text: true }),
                axisType = PulseChart.Properties["general"]["formatString"],
                isScalar: boolean =  CartesianChart.getIsScalar(dataView.metadata ? dataView.metadata.objects : null, axisType, categoryType);

            this.setSize(options.viewport); 
            this.data = this.converter(dataView, isScalar);

            if (!this.data) {
                this.clear();
                return;
            }

            this.calculateAxesProperties();
            this.render(true);
        }
 
        private isSizeAvailable(viewport: IViewport): boolean {
            if ((viewport.height < PulseChart.DefaultViewport.height) || 
                (viewport.width < PulseChart.DefaultViewport.width)) {
                    return false; 
            }

            return true;
        }
 
        private setSize(viewport: IViewport): void {
            var height: number,
                width: number;

            height = viewport.height - this.margin.top - this.margin.bottom;
            width = viewport.width - this.margin.left - this.margin.right;
            
            height = Math.max(height, PulseChart.DefaultViewport.height);
            width  = Math.max(width, PulseChart.DefaultViewport.width);

            this.viewport = {
                height: height,
                width: width
            };

            this.updateElements(viewport.height, viewport.width);
        }

        private updateElements(height: number, width: number): void {
            this.svg.attr({
                'height': height,
                'width': width
            });

            this.gaps.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top + (this.viewport.height / 2)));
            this.chart.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top));
            this.yAxis.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top));
            this.xAxis.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top + (this.viewport.height / 2)));
        }

        public calculateAxesProperties() {
            var xAxes: D3.Svg.Axis[];

            this.data.xAxisProperties = this.getXAxisProperties();
            this.data.yAxisProperties = this.getYAxisProperties();

            xAxes = this.createAxisX(
                this.data.series,
                <D3.Scale.LinearScale> this.data.xAxisProperties.scale,
                PulseChart.DefaultFormatString,
                this.data.settings.xAxis.step,
                this.data.settings.xAxis.show);

            this.data.series.forEach((series: PulseChartSeries, index: number) => {
                series.xAxis = xAxes[index];
            });
        }

        private static isOrdinal(type: ValueType): boolean {
            return !!(type && (type.text || type.bool));
        }

        private static createOrdinalDomain(data: PulseChartSeries[]): number[] {
            if (_.isEmpty(data)) {
                return [];
            }

            var xDomain: number[] = [];
            for (var i: number = 0; i < data.length; i++) {
                xDomain = xDomain.concat(data[i].data.map(d => d.categoryIndex));

                if (i < data.length - 1) {
                    xDomain = xDomain.concat(
                        PulseChart.getNumberSequence(xDomain[xDomain.length - 1],
                        PulseChart.ShiftCategoryIndex));
                }
            }

            return xDomain;
        }

        private static getNumberSequence(minNumber: number, countOfNumbers: number): number[] {
            var numbers: number[] = [];

            for (var i = minNumber; i < minNumber + countOfNumbers; i++) {
                numbers.push(i);
            }

            return numbers;
        }

        private static createDomain(data: PulseChartSeries[], axisType: ValueType, isScalar: boolean, forcedScalarDomain: any[]): number[]{
            if (isScalar && !PulseChart.isOrdinal(axisType)) {
                var userMin, userMax;
                if (forcedScalarDomain && forcedScalarDomain.length === 2) {
                    userMin = forcedScalarDomain[0];
                    userMax = forcedScalarDomain[1];
                }

               return [userMin, userMax];
            }

            return PulseChart.createOrdinalDomain(data);
        }

        private getXAxisProperties(): IAxisProperties {
            var data: PulseChartData = this.data,
                categoryThickness: number = 0,
                categoryDataType: ValueType = AxisHelper.getCategoryValueType(data.categoryMetadata),
                xDomain: number[] = PulseChart.createDomain(data.series, categoryDataType, data.isScalar, [data.categories[0], data.categories[data.categories.length - 1]]),
                xMetaDataColumn: DataViewMetadataColumn = data.categoryMetadata,
                formatString: string = valueFormatter.getFormatString(xMetaDataColumn, PulseChart.Properties["general"]["formatString"]);

            var properties = AxisHelper.createAxis({
                pixelSpan: this.viewport.width,
                dataDomain: xDomain,
                metaDataColumn: xMetaDataColumn,
                formatString: formatString,
                outerPadding: 0,
                isScalar: this.data.isScalar,
                isVertical: false,
                forcedTickCount: 0,
                useTickIntervalForDisplayUnits: true,
                getValueFn: (index, type) => data.categories[index],
                categoryThickness: categoryThickness,
                isCategoryAxis: false,
                scaleType: this.scaleType,
                axisDisplayUnits: undefined,
                axisPrecision: undefined
            });

            return properties;
        }

        private createAxisX(series: PulseChartSeries[], originalScale: D3.Scale.LinearScale, formatString: string, step: number = 30, show: boolean = true): D3.Svg.Axis[] {
            var xAxisProperties: PulseChartXAxisProperties[] = [];

            xAxisProperties = series.map((seriesElement: PulseChartSeries) => {
                var formatter: IValueFormatter,
                    timeScale: D3.Scale.TimeScale,
                    dataPoints: PulseChartDataPoint[] = seriesElement.data,
                    minDate: Date = dataPoints[0].categoryValue,
                    maxDate: Date = dataPoints[dataPoints.length - 1].categoryValue,
                    minX: number = originalScale(dataPoints[0].categoryIndex),
                    maxX: number = originalScale(dataPoints[dataPoints.length - 1].categoryIndex),
                    dates: Date[] = [];

                timeScale = d3.time.scale()
                    .domain([minDate, maxDate])
                    .rangeRound([minX, maxX]);

                formatter = valueFormatter.create({
                    format: formatString,
                    value: minDate,
                    value2: maxDate
                });

                if (show) {
                    dates = d3.time.minute.range(minDate, maxDate, step);
                }

                return <PulseChartXAxisProperties> {
                    dates: dates,
                    scale: timeScale,
                    formatter: formatter
                };
            });

            this.resolveIntersections(xAxisProperties);

            return xAxisProperties.map((properties: PulseChartXAxisProperties) => {
                var dates: Date[] = properties.dates.filter((date: Date) => date !== null);

                return d3.svg.axis()
                    .scale(properties.scale)
                    .tickValues(dates)
                    .tickFormat((value: Date) => {
                        return properties.formatter.format(value);
                    })
            });
        }

        private resolveIntersections(xAxisProperties: PulseChartXAxisProperties[]): void {
            var leftPoint: PulseChartPoint = null,
                rightPoint: PulseChartPoint = null,
                currentPoint: PulseChartPoint = null;

            xAxisProperties.forEach((properties: PulseChartXAxisProperties) => {
                var scale: D3.Scale.TimeScale = properties.scale,
                    length: number = properties.dates.length;

                for (var i = 0; i < length; i++) {
                    var currentDate: Date = properties.dates[i];

                    currentPoint = {
                        value: properties.dates[i],
                        x: scale(currentDate)
                    };

                    if (!leftPoint) {
                        var leftDate: Date = properties.dates[i - 1];

                        leftPoint = {
                            value: leftDate,
                            x: scale(leftDate)
                        };
                    }

                    if (this.isIntersect(leftPoint, currentPoint)) {
                        properties.dates[i] = null;
                        rightPoint = null;

                        continue;
                    }

                    if (!rightPoint && i < length - 1) {
                        var rightDate: Date = properties.dates[i + 1];

                        rightPoint = {
                            value: rightDate,
                            x: scale(rightDate)
                       };
                    } else {
                        leftPoint = currentPoint;
                    }

                    if (rightPoint && this.isIntersect(currentPoint, rightPoint)) {
                        properties.dates[i + 1] = null;
                        leftPoint = currentPoint;
                        i++;
                    }

                    rightPoint = null;
                }
            });
        }

        private isIntersect(leftPoint: PulseChartPoint, rightPoint: PulseChartPoint): boolean {
            return (leftPoint.x + PulseChart.MaxWidthOfLabel) > rightPoint.x;
        }

        /**
         * Creates a [min,max] from your Cartiesian data values.
         * 
         * @param data The series array of CartesianDataPoints.
         * @param includeZero Columns and bars includeZero, line and scatter do not.
         */
        private static createValueDomain(data: PulseChartSeries[], includeZero: boolean): number[] {
            if (data.length === 0) {
                return null;
            }

            var minY0 = <number>d3.min(data,(kv) => { return d3.min(kv.data, d => { return d.y; }); });
            var maxY0 = <number>d3.max(data, (kv) => { return d3.max(kv.data, d => { return d.y; }); });

            // var min = Math.min(minY0, -1 * maxY0);
            //console.log('min', min, 'min', minY0, 'max', maxY0);
            return [Math.min(minY0, maxY0), Math.max(minY0, maxY0)];
        }

        private getYAxisProperties(): IAxisProperties {
            this.yDomain = PulseChart.createValueDomain(this.data.series, false);
            var lowerMeasureIndex = 0;//this.data.series.length === 1 ? 0 : this.data.lowerMeasureIndex;
            var yMetaDataColumn: DataViewMetadataColumn  = this.data.series.length? this.data.series[lowerMeasureIndex].yCol : undefined;
            var yAxisProperties = AxisHelper.createAxis({
                pixelSpan: this.viewport.height,
                dataDomain: this.yDomain,
                metaDataColumn: yMetaDataColumn,
                //formatStringProp: PulseChart.properties.general.formatString,
                formatString: valueFormatter.getFormatString(yMetaDataColumn, PulseChart.Properties["general"]["formatString"]),
                outerPadding: 0,
                isScalar: true,//this.data.isScalar,
                isVertical: true,
                useTickIntervalForDisplayUnits: true,
                isCategoryAxis: false,
                scaleType: this.scaleType,
            });

            return yAxisProperties;
        }

        public render(suppressAnimations: boolean): CartesianVisualRenderResult {
            var duration = AnimatorCommon.GetAnimationDuration(this.animator, suppressAnimations);
            var result: CartesianVisualRenderResult;
            var data = this.data;

            if (!data) {
                this.clear();
                return;
            }

            this.renderGaps(data, duration);
            this.renderAxes(data, duration);
            this.renderChart(data, 0);
            this.renderControls(data, duration);

            return result;
        }


        private renderControls(data: PulseChartData, duration: number): void {
            this.animationPlay.style("display", null);
            this.animationPause.style("display", null);

            var playCoords = [
                { x: 0, y: 0 },
                { x: 20, y: 10 },
                { x: 0, y: 20 }
            ];

            var line: D3.Svg.Line = d3.svg.line()
                .x(d => d.x)
                .y(d => d.y);


            this.animationPlay
                .attr("d", line(playCoords))
                .attr("fill", "green")
                .on("click", () => {
                    this.clearChart();
                    this.renderChart(data, 10000);
                });

            var playCoords = [
                { x: 30, y: 0 },
                { x: 50, y: 0 },
                { x: 50, y: 20 },
                { x: 30, y: 20 }
            ];
                /*
            this.animationPause
                    .attr("d", line(playCoords))
                    .attr("fill", "red")
                    .on("click", () => {
                        console.log('Play click');

                       // this.renderChart(data, 3000, 2);
                    });
                    */
        }


        private renderAxes(data: PulseChartData, duration: number): void {
            this.renderXAxis(data, duration);
            this.renderYAxis(data, duration);
        }

        private renderXAxis(data: PulseChartData, duration: number): void {
            var axisNodeSelection: D3.Selection,
                axisNodeUpdateSelection: D3.UpdateSelection,
                ticksSelection: D3.Selection,
                ticksUpdateSelection: D3.UpdateSelection;

            axisNodeSelection = this.xAxis.selectAll(PulseChart.AxisNode.selector);

            axisNodeUpdateSelection = axisNodeSelection.data(data.series);

            axisNodeUpdateSelection
                .enter()
                .append("g")
                .classed(PulseChart.AxisNode.class, true);

            axisNodeUpdateSelection
                .call((selection: D3.Selection) => {
                    selection[0].forEach((selectionElement: Element, index: number) => {
                        d3.select(selectionElement)
                            .transition()
                            .duration(duration)
                            .call(data.series[index].xAxis.orient('bottom'));
                    });
                });

            axisNodeUpdateSelection
                .exit()
                .remove();

            ticksSelection = this.xAxis.selectAll(".tick");

            ticksUpdateSelection = ticksSelection
                .selectAll(".axisBox")
                .data([[]]);

            ticksUpdateSelection
                .enter()
                .insert("rect", "text")
                .attr({
                    x: -(PulseChart.MaxWidthOfLabel / 2),
                    y: "-0.7em",
                    width: PulseChart.MaxWidthOfLabel,
                    height: "1.3em"
                })
                .classed("axisBox", true);

            ticksUpdateSelection
                .exit()
                .remove();

            this.xAxis
                .selectAll("text")
                .attr({
                    dy: "-0.5em"
                });

            this.xAxis.selectAll(".domain")[0].forEach((element: Element) => {
                element.parentNode.insertBefore(element, element.parentNode.firstChild);
            });
        }

        private renderYAxis(data: PulseChartData, duration: number): void {
            var yAxis: D3.Svg.Axis = data.yAxisProperties.axis;

            yAxis.orient('left');

            /*
            this.yAxis
                .transition()
                .duration(duration)
                .call(yAxis);*/
        }

        private renderChart(data: PulseChartData, duration?: number): void {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                sm = this.selectionManager;

            var selection: D3.UpdateSelection;

            selection = this.chart.selectAll(PulseChart.LineNode.selector).data(series);

            selection
                .enter()
                .append('g')
                .classed(PulseChart.LineNode.class, true);

            if (duration) {
                this.drawLines(selection, data, duration, 0);
            } else {
                this.drawLines(selection, data);
                this.drawDots(selection, data);
            }
            selection
                .exit()
                .remove();
        }

        private drawLines(rootSelection: D3.UpdateSelection, data: PulseChartData, duration?: number, seriesCount?: number): void {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                node: ClassAndSelector = PulseChart.Line,
                sm = this.selectionManager;

           var line: D3.Svg.Line = d3.svg.line()
                .x((d: PulseChartDataPoint) => {
                    return xScale(isScalar ? d.categoryValue : d.categoryIndex);
                })
                .y((d: PulseChartDataPoint) => yScale(d.y))

            var selection: D3.UpdateSelection = rootSelection.filter((d, index) => {
                if (duration > 0) {
                    return index === seriesCount;
                }

                if (seriesCount) {
                    return index < seriesCount;
                }
                return true;
                }).selectAll(node.selector).data(d => [d]);

            selection
                .enter()
                .append('path');

            selection
                .classed(node.class, true)
                .style({
                    'fill': "none",
                    'stroke': (d: PulseChartSeries) => d.color,
                    'stroke-width': (d: PulseChartSeries) => `${d.width}px`
                })

             var last_identity = null;
                
             var getInterpolation = (d: PulseChartSeries) => {

              var interpolate = d3.scale.quantile()
                  .domain([0,1])
                  .range(d3.range(1, d.data.length + 1));

               return (t) => {
                  if (t > 0.5) {
                   //  selection.transition().duration( 0 );
                  }
                  var index = interpolate(t);
                 // console.log('is_tooltip', index, d.data[index].);
                  if (index && d.data[index]){
                      var is_tooltip = d.data[index].popupInfo;
                      var identity = d.data[index].identity;

                      if (is_tooltip && last_identity != identity ) {
                           last_identity = identity;
                           
                           
                           sm.select(d.data[index].identity)
                                .then((selectionIds: SelectionId[]) => {
                                  
                                    this.setSelection(rootSelection, selectionIds);
                                 
                                });
                           //setTimeout(5000);
                      }
                  }


                  var interpolatedLine = d.data.slice(0, interpolate(t));
                  return line(interpolatedLine);
                  }
              }

           if (duration > 0) {
               selection
                .transition()
                .duration(duration)
                .attrTween('d', d => getInterpolation(d)).each("end", () => {

                  seriesCount++;
                  if (seriesCount < data.series.length) {
                      this.drawLines(rootSelection, data, duration, seriesCount++);
                  }

                });
           } else {
               selection.attr('d', d => line(d.data));
           }

           selection
                .exit()
                .remove();
        }

        private drawDots(rootSelection: D3.UpdateSelection, data: PulseChartData): void {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                node: ClassAndSelector = PulseChart.Dot,
                sm = this.selectionManager;


            var selection: D3.UpdateSelection = rootSelection.selectAll(node.selector)
                .data(d => {
                    return _.filter(d.data, (value: PulseChartDataPoint) => value.popupInfo);
                 });

            selection
                .enter()
                .append("circle")
                .classed(node.class, true);

            selection
                .attr("cx", (d: PulseChartDataPoint) => {
                    return xScale(isScalar ? d.categoryValue : d.categoryIndex);
                })
                .attr("cy", (d: PulseChartDataPoint) => yScale(d.y))
                .attr("r", 5)
                .style("fill", PulseChart.DefaultTooltipSettings.dataPointColor)
                .style("cursor", "pointer")
                .on("mouseover", function(d) {
                    d3.select(this)
                        .style("fill", "#494949")
                        .attr("r", 6);
                })
                .on("mouseout", function(d) {
                    d3.select(this)
                        .style("fill", PulseChart.DefaultTooltipSettings.dataPointColor)
                        .attr("r", 5);
                });

            this.setSelectHandler(selection, rootSelection);

            selection
                .exit()
                .remove();
        }

        private renderGaps(data: PulseChartData, duration: number): void {
            var gaps: IRect[],
                gapsSelection: D3.UpdateSelection,
                gapsEnterSelection: D3.Selection,
                gapNodeSelection: D3.UpdateSelection,
                shiftIndex: number = PulseChart.ShiftCategoryIndex / 2,
                series: PulseChartSeries[] = data.series,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale;

            gaps = [{
                left: -4.5,
                top: -5,
                height: 10,
                width: 3
            }, {
                left: 1.5,
                top: -5,
                height: 10,
                width: 3
            }];

            gapsSelection = this.gaps.selectAll(PulseChart.Gap.selector)
                .data(series.slice(0, series.length - 1));

            gapsEnterSelection = gapsSelection
                .enter()
                .append("g");

            gapsSelection
                .attr("transform", (seriesElement: PulseChartSeries, index: number) => {
                    var x: number;

                    x = xScale(seriesElement.data[seriesElement.data.length - 1].categoryIndex + shiftIndex);

                    return SVGUtil.translate(x, 0);
                });

            gapNodeSelection = gapsSelection.selectAll(PulseChart.GapNode.selector)
                .data(gaps);

            gapNodeSelection
                .enter()
                .append("rect")
                .attr({
                    x: (gap: IRect) => gap.left,
                    y: (gap: IRect) => gap.top,
                    height: (gap: IRect) => gap.height,
                    width: (gap: IRect) => gap.width
                })
                .classed(PulseChart.GapNode.class, true);

            gapsEnterSelection.classed(PulseChart.Gap.class, true);

            gapsSelection
                .exit()
                .remove();

            gapNodeSelection
                .exit()
                .remove();
        }

        private setSelectHandler(selection: D3.UpdateSelection, rootSelection: D3.UpdateSelection): void {
            var sm: SelectionManager = this.selectionManager;

            this.setSelection(rootSelection);

            selection.on("click", (d: PulseChartDataPoint) => {
                sm.select(d.identity, d3.event.ctrlKey)
                    .then((selectionIds: SelectionId[]) => this.setSelection(rootSelection, selectionIds));

                d3.event.stopPropagation();
            });

            this.svg.on("click", () => {
                this.selectionManager.clear();
                this.setSelection(rootSelection);
            });
        }        

        private setSelection(selection: D3.UpdateSelection, selectionIds?: SelectionId[]): void {
            this.drawTooltips(selection, this.data, selectionIds);
        }

        private isPopupShow(d: PulseChartDataPoint, selectionIds?: SelectionId[]): boolean {
            var data = this.data;

            if (!d.popupInfo) {
                return false;
            }

            

            if (data &&
                data.settings &&
                data.settings.popup) {
                if (data.settings.popup.showType == PulseChartPopupShow.ALWAYS) {
                    return true;
                }
                if (data.settings.popup.showType == PulseChartPopupShow.HIDE) {
                    return false;
                }
            }

            if (!selectionIds) {
                return false;
            }
            return selectionIds.some((selectionId: SelectionId) => {
                return d.identity === selectionId;
            });

            return false;
        }
    
        private drawTooltips(rootSelection: D3.UpdateSelection, data: PulseChartData, selectionIds?: SelectionId[]) {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                node: ClassAndSelector = PulseChart.Tooltip,
                sm = this.selectionManager;

            var line: D3.Svg.Line = d3.svg.line()
                .x(d => d.x)
                .y(d => d.y);

            var marginTop: number = PulseChart.DefaultTooltipSettings.marginTop;   
            var width: number = this.data.settings.popup.width;   
            var height: number = PulseChart.DefaultTooltipSettings.height;

            var topShift: number = 20; 

            var durationTooltip: number = 1000;
            var durationLine: number = 700;

            var tooltipShiftY = (y: number) => this.isHigherMiddle(y) ? (-1 * marginTop + topShift) : this.viewport.height + marginTop;

            var tooltipRoot: D3.UpdateSelection = rootSelection.selectAll(node.selector)
                .data(d => _.filter(d.data, (value: PulseChartDataPoint) => this.isPopupShow(value, selectionIds)));

            tooltipRoot.enter().append("g").classed(node.class, true);

            tooltipRoot
                .attr("transform", (d: PulseChartDataPoint) => {
                    var x: number = xScale(isScalar ? d.categoryValue : d.categoryIndex) - width/2;
                    var y: number = tooltipShiftY(d.y);
                    return SVGUtil.translate(x, y);
                })
                .style("opacity", 0)
                .transition()
                .duration(durationTooltip)
                .style("opacity", 1);

            var tooltipRect = tooltipRoot.selectAll(PulseChart.TooltipRect.selector).data(d => [d]);
            tooltipRect.enter().append("path").classed(PulseChart.TooltipRect.class, true);
            tooltipRect           
                .attr("display", (d: PulseChartDataPoint) => d.popupInfo ? "inherit" : "none")
                .style('fill', this.data.settings.popup.color)
                .attr('d', (d: PulseChartDataPoint) => { 
                    var path = [
                        { 
                            "x": -2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * marginTop) : 0,
                        },
                        { 
                            "x": -2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * (marginTop + height)) : height,
                        },
                        { 
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * (marginTop + height)) : height,
                        },
                        {
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * marginTop) : 0,
                        }
                    ];
                    return line(path);
                });
                /*
            .style('stroke', "white")
            .style('stroke-width', "1px");*/

            var tooltipTriangle = tooltipRoot.selectAll(PulseChart.TooltipTriangle.selector).data(d => [d]);
            tooltipTriangle.enter().append("path").classed(PulseChart.TooltipTriangle.class, true);
            tooltipTriangle         
                .style('fill', this.data.settings.popup.color)
                .attr('d', (d: PulseChartDataPoint) => {
                    var path = [
                        {
                            "x": width / 2 - 5,
                            "y": this.isHigherMiddle(d.y) ? (-1 * marginTop) : 0,
                        },
                        {
                            "x": width / 2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * (marginTop - 5)) : -5,
                        },
                        {
                            "x": width / 2 + 5,
                            "y": this.isHigherMiddle(d.y) ? (-1 * marginTop) : 0,
                        },
                    ];
                    return line(path);
                })
                .style('stroke-width', "1px");    
                        
            var tooltipLine = tooltipRoot.selectAll(PulseChart.TooltipLine.selector).data(d => [d]);
            tooltipLine.enter().append("path").classed(PulseChart.TooltipLine.class, true);
            tooltipLine
                .style('fill', this.data.settings.popup.color)
                .style('stroke', this.data.settings.popup.color)
                .style('stroke-width', "1px")
                .attr('d', (d: PulseChartDataPoint) => { 
                    var path = [
                        { 
                            "x": width/2,
                            "y": this.isHigherMiddle(d.y) ? yScale(d.y) + tooltipShiftY(d.y) : yScale(d.y) - tooltipShiftY(d.y), //start
                        },
                        { 
                            "x": width/2,
                            "y": this.isHigherMiddle(d.y) ? yScale(d.y) + tooltipShiftY(d.y) : yScale(d.y) - tooltipShiftY(d.y),
                        }];
                    return line(path);
                })
                .transition()
                .duration(durationLine)
                .attr('d', (d: PulseChartDataPoint) => { 
                    var path = [
                        { 
                            "x": width/2,
                            "y": this.isHigherMiddle(d.y) ? yScale(d.y) + tooltipShiftY(d.y) : yScale(d.y) - tooltipShiftY(d.y),
                        },
                        { 
                            "x": width/2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * marginTop) : 0, //end
                        }];
                    return line(path);
                });

            var timeRect = tooltipRoot.selectAll(PulseChart.TooltipTimeRect.selector).data(d => [d]);
            var timeDisplayStyle = { "display": this.data.settings.popup.showTime ? "" : "none" };
            timeRect.enter().append("path").classed(PulseChart.TooltipTimeRect.class, true);
            timeRect
                .style("fill", this.data.settings.popup.timeFill)
                .style(timeDisplayStyle)
                .attr('d', (d: PulseChartDataPoint) => { 
                    var path = [
                        { 
                            "x": width - PulseChart.DefaultTooltipSettings.timeWidth - 2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * (marginTop + height)) : 0,
                        },
                        { 
                            "x": width - PulseChart.DefaultTooltipSettings.timeWidth  -2,
                            "y": this.isHigherMiddle(d.y)
                                ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight))
                                : PulseChart.DefaultTooltipSettings.timeHeight,
                        },
                        { 
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y)
                                ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight))
                                : PulseChart.DefaultTooltipSettings.timeHeight,
                        },
                        { 
                            "x": width - 2,
                            "y": this.isHigherMiddle(d.y) ? (-1 * (marginTop + height)) : 0,
                        }
                    ];
                    return line(path);
                });

            var time = tooltipRoot.selectAll(PulseChart.TooltipTime.selector).data(d => [d]);
            time.enter().append("text").classed(PulseChart.TooltipTime.class, true);
            time
                .style({
                    "font-family": "sans-serif",
                    "font-weight": "bold",
                    "font-size": "12px"
                })
                .style(timeDisplayStyle)
                .style("fill", this.data.settings.popup.timeColor)
                .attr("x", (d: PulseChartDataPoint) => width - PulseChart.DefaultTooltipSettings.timeWidth)
                .attr("y", (d: PulseChartDataPoint) => this.isHigherMiddle(d.y) 
                    ? (-1 * (marginTop + height - PulseChart.DefaultTooltipSettings.timeHeight  + 3)) 
                    : PulseChart.DefaultTooltipSettings.timeHeight - 3)
                .text((d: PulseChartDataPoint) => d.popupInfo.time);
                     
            var title = tooltipRoot.selectAll(PulseChart.TooltipTitle.selector).data(d => [d]);
            title.enter().append("text").classed(PulseChart.TooltipTitle.class, true);
            title
                .style({
                    "font-family": "sans-serif",
                    "font-weight": "bold",
                    "font-size": "12px"
                })
                .style("fill", this.data.settings.popup.fontColor)
                //.attr("stroke", "white")
                .attr("x", (d: PulseChartDataPoint) => 0)
                .attr("y", (d: PulseChartDataPoint) => this.isHigherMiddle(d.y) ? (-1 * (marginTop + height - 12)) : 12)
                .text((d: PulseChartDataPoint) => {
                    if (!d.popupInfo) {
                        return "";
                    }
                         
                    var textProperties = {
                        text: d.popupInfo.title || "",
                        fontFamily: "sans-serif",
                        fontSize: "12px"
                    };
                                                 
                    return powerbi.TextMeasurementService.getTailoredTextOrDefault(textProperties, 
                        width - 2 - (this.data.settings.popup.showTime ? PulseChart.DefaultTooltipSettings.timeWidth : 0));
                });
            
            var textFontSize = `${this.data.settings.popup.fontSize}px`;
            var description = tooltipRoot.selectAll(PulseChart.TooltipDescription.selector).data(d => [d]);
            description.enter().append("text").classed(PulseChart.TooltipDescription.class, true);
            description
                .style({
                    "font-family": "sans-serif",
                    "font-size": textFontSize
                })
                .style("fill", this.data.settings.popup.fontColor)
                .attr("x", (d: PulseChartDataPoint) => 0)
                .attr("y", (d: PulseChartDataPoint) => 0)
                .text((d: PulseChartDataPoint) => d.popupInfo && d.popupInfo.description)
                .call(d => d.forEach(x => x[0] && 
                    powerbi.TextMeasurementService.wordBreak(x[0], width - 2, height - 26)))
                .attr("x", (d: PulseChartDataPoint) => 0)
                .attr("y", (d: PulseChartDataPoint) => this.isHigherMiddle(d.y) ? (-1 * (marginTop + height - 26)) : 26)

            tooltipRoot
                .exit()
                .remove();
        }


        private isHigherMiddle(value: number): boolean {
            var minValue: number = d3.min(this.yDomain),
                middleValue = Math.abs((d3.max(this.yDomain) - minValue) / 2) ;

            middleValue = middleValue === 0
                ? middleValue
                : minValue + middleValue;

            return value >= middleValue;
        }

        private static getObjectsFromDataView(dataView: DataView): DataViewObjects {
            if (!dataView ||
                !dataView.metadata ||
                !dataView.metadata.columns ||
                !dataView.metadata.objects) {
                return null;
            }

            return dataView.metadata.objects;
        }

        private parseSettings(dataView: DataView): PulseChartSettings {
            var settings: PulseChartSettings = <PulseChartSettings>{},
                objects: DataViewObjects = PulseChart.getObjectsFromDataView(dataView);

            settings.popup = this.getPopupSettings(objects);
            settings.xAxis = this.getAxisXSettings(objects);
            settings.series = this.getSeriesSettings(objects);
            settings.playback = PulseChart.getPlaybackSettings(objects);

            return settings;
        }

        private getPopupSettings(objects: DataViewObjects): PulseChartPopup {
            var showType = DataViewObjects.getValue<string>(
                objects,
                PulseChart.Properties["popup"]["showType"],
                PulseChart.DefaultSettings.popup.showType);

            var width = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["popup"]["width"],
                PulseChart.DefaultSettings.popup.width);

            width = Math.max(0, width);

            var colorHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["popup"]["color"],
                PulseChart.DefaultSettings.popup.color);

            var color = colorHelper.getColorForMeasure(objects, "");

            var fontSize = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["popup"]["fontSize"],
                PulseChart.DefaultSettings.popup.fontSize);

            var fontColorHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["popup"]["fontColor"],
                PulseChart.DefaultSettings.popup.fontColor);

            var fontColor = fontColorHelper.getColorForMeasure(objects, "");

            var showTime =  DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["popup"]["showTime"],
                PulseChart.DefaultSettings.popup.showTime);
                
            var timeColorHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["popup"]["timeColor"],
                PulseChart.DefaultSettings.popup.timeColor);

            var timeColor = timeColorHelper.getColorForMeasure(objects, "");

            var timeFillHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["popup"]["timeFill"],
                PulseChart.DefaultSettings.popup.timeFill);

            var timeFill = timeFillHelper.getColorForMeasure(objects, "");

            return {
                showType,
                width,
                color,
                fontSize,
                fontColor,
                showTime,
                timeColor,
                timeFill
            };
        }

        private getSeriesSettings(objects: DataViewObjects): PulseChartSeriesSetting {
            var width = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["series"]["width"],
                PulseChart.DefaultSettings.series.width);

            var colorHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["series"]["fill"],
                PulseChart.DefaultSettings.series.fill);

            var fill = colorHelper.getColorForMeasure(objects, "");

            var showByDefault = DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["series"]["showByDefault"],
                PulseChart.DefaultSettings.series.showByDefault);

            return {
                width,
                fill,
                showByDefault
            };
        }

        private getAxisXSettings(objects: DataViewObjects): PulseChartXAxisSettings {
            var xAxisSettings: PulseChartXAxisSettings = <PulseChartXAxisSettings> {};

            xAxisSettings.show = DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["xAxis"]["show"],
                PulseChart.DefaultSettings.xAxis.show);

            xAxisSettings.step = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["xAxis"]["step"],
                PulseChart.DefaultSettings.xAxis.step);

            return xAxisSettings;
        }

        private static getPlaybackSettings(objects: DataViewObjects): PulseChartPlaybackSetting {
            var playbackSettings: PulseChartPlaybackSetting = <PulseChartPlaybackSetting> {};

            playbackSettings.autoplay = DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["playback"]["autoplay"],
                PulseChart.DefaultSettings.playback.autoplay);

            playbackSettings.pauseDuration = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["playback"]["pauseDuration"],
                PulseChart.DefaultSettings.playback.pauseDuration);

            playbackSettings.autoplayPauseDuration = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["playback"]["autoplayPauseDuration"],
                PulseChart.DefaultSettings.playback.autoplayPauseDuration);

            return playbackSettings;
        }

        private clear(): void {
            this.clearChart();
            this.gaps.selectAll(PulseChart.Gap.selector).remove();
            this.xAxis.selectAll(PulseChart.AxisNode.selector).remove();
            this.animationPlay.style("display", "none");
            this.animationPause.style("display", "none");
        }

        private clearChart(): void {
           this.chart.selectAll(PulseChart.LineNode.selector).remove();
           this.chart.selectAll(PulseChart.Dot.selector).remove();
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            var enumeration = new ObjectEnumerationBuilder(),
                settings: PulseChartSettings;

            settings = this.data.settings;

            switch (options.objectName) {
                case "popup": {
                    this.readPopupInstance(enumeration);
                    break;
                }
                case "xAxis": {
                    this.xAxisInstance(enumeration);
                    break;
                }
                case "series": {
                    this.readSeriesInstance(enumeration);
                    break;
                }
                case "playback": {
                    this.readPlaybackInstance(enumeration);
                    break;
                }
            }

            return enumeration.complete();
        }

        private readPopupInstance(enumeration: ObjectEnumerationBuilder): void {
            var popupSettings: PulseChartPopup = this.data.settings.popup;

            if (!popupSettings) {
                popupSettings = PulseChart.DefaultSettings.popup;
            }

            var popup: VisualObjectInstance = {
                objectName: "popup",
                displayName: "popup",
                selector: null,
                properties: {
                    showType: popupSettings.showType,
                    width: popupSettings.width,
                    color: popupSettings.color,
                    fontColor: popupSettings.fontColor,
                    fontSize: popupSettings.fontSize,
                    showTime: popupSettings.showTime,
                    timeColor: popupSettings.timeColor,
                    timeFill: popupSettings.timeFill    
                }
            };

            enumeration.pushInstance(popup);
        }

        private xAxisInstance(enumeration: ObjectEnumerationBuilder): void {
            var xAxisSettings: PulseChartXAxisSettings = 
                this.data.settings.xAxis || PulseChart.DefaultSettings.xAxis;

            enumeration.pushInstance({
                objectName: "xAxis",
                displayName: "xAxis",
                selector: null,
                properties: {
                    show: xAxisSettings.show,
                    step: xAxisSettings.step
                }
            });
        }

        private readSeriesInstance(enumeration: ObjectEnumerationBuilder): void {
            var seriesSettings: PulseChartSeriesSetting = 
                this.data.settings.series || PulseChart.DefaultSettings.series;
      
            var series: VisualObjectInstance = {
                objectName: "series",
                displayName: "series",
                selector: null,
                properties: {
                    fill: seriesSettings.fill,
                    width: seriesSettings.width,
                    showByDefault: seriesSettings.showByDefault,
                }
            };

            enumeration.pushInstance(series);
        }

        private readPlaybackInstance(enumeration: ObjectEnumerationBuilder): void {
            var playbackSettings: PulseChartPlaybackSetting = 
                this.data.settings.playback || PulseChart.DefaultSettings.playback;

            enumeration.pushInstance({
                objectName: "playback",
                displayName: "playback",
                selector: null,
                properties: {
                    autoplay: playbackSettings.autoplay,                    
                    pauseDuration: playbackSettings.pauseDuration,
                    autoplayPauseDuration: playbackSettings.autoplayPauseDuration,
                }
            });
        }
    }

    export class PulseChartBehavior implements IInteractiveBehavior {
        private behaviors: IInteractiveBehavior[];

        constructor(behaviors: IInteractiveBehavior[]) {
            this.behaviors = behaviors;
        }

        public bindEvents(options: PulseChartBehaviorOptions, selectionHandler: ISelectionHandler): void {
            var behaviors = this.behaviors;
            for (var i: number = 0, ilen: number = behaviors.length; i < ilen; i++) {
                behaviors[i].bindEvents(options.layerOptions[i], selectionHandler);
            }

            options.clearCatcher.on('click', () => {
                selectionHandler.handleClearSelection();
            });
        }

        public renderSelection(hasSelection: boolean) {
            for (var i: number = 0; i < this.behaviors.length; i++) {
                this.behaviors[i].renderSelection(hasSelection);
            }
        }
    }
}
