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
            marginTop: number;
            width: number;
            height: number;
    }

    export interface PulseChartSeries extends LineChartSeries {
        name?: string;
        data: PulseChartDataPoint[];
        color: string;
        identity: SelectionId;
    }

    export interface PulseChartDataPoint extends LineChartDataPoint {
       y?: number;
       // y1?: number;
    }

    export interface PulseChartLegend extends DataViewObject {
        show?: boolean;
        showTitle?: boolean;
        titleText?: string;
        position?: LegendPosition;
    }

    export interface PulseChartPopup {
        showAll: boolean
    }

    export interface PulseChartDataPointSetting {
        fill: string;
        width: number;
        showAll: boolean;
    }

    export interface PulseChartXAxisSettings {
        step: number;
    }

    export interface PulseChartSettings {
        displayName?: string;
        fillColor?: string;
        precision: number;
        legend?: PulseChartLegend;
        colors?: IColorPalette;
        dataPoint?: PulseChartDataPointSetting;
        popup?: PulseChartPopup;
        xAxis: PulseChartXAxisSettings
    }

    export interface PulseChartData /*extends LineChartData*/ {
        categoryMetadata: DataViewMetadataColumn;
        hasHighlights?: boolean;

        series: LineChartSeries[];
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
                    displayName: PulseChart.RoleNames.Category,
                    name: PulseChart.RoleNames.Category,
                    kind: powerbi.VisualDataRoleKind.Grouping,
                },
                {
                    displayName: PulseChart.RoleNames.Value,
                    name: PulseChart.RoleNames.Value,
                    kind: powerbi.VisualDataRoleKind.Measure,
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
                        'Timestamp': { min: 0, max: 1 },
                        'Category': { max: 0 },
                        'Value': { max: 0 },
                        'EventTitle': { max: 0 },
                        'EventDescription': { max: 0 },
                    },
                    {
                        'Timestamp': { min: 1, max: 1 },
                        'Category': { min: 1, max: 1 },
                        'Value': { max: 0 },
                        'EventTitle': { max: 0 },
                        'EventDescription': { max: 0 },
                    },
                    {
                        'Timestamp': { min: 1, max: 1 },
                        'Category': { min: 1, max: 1 },
                        'Value': { min: 1, max: 1 },
                        'EventTitle': { max: 1 },
                        'EventDescription': { max:1 },
                    }
                ],
                categorical: {
                    categories: {
                        for: { in: PulseChart.RoleNames.Timestamp },
                        dataReductionAlgorithm: { top: {} }
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
                dataPoint: {
                    displayName: data.createDisplayNameGetter('Visual_DataPoint'),
                    description: data.createDisplayNameGetter('Visual_DataPointDescription'),
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
                        showAll: {
                            displayName: "Show All",
                            type: { bool: true }
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
                        showAll: {
                            displayName: "Show All",
                            type: { bool: true }
                        },
                    }
                },
                xAxis: {
                    displayName: data.createDisplayNameGetter('Visual_XAxis'),
                    properties: {
                        step: {
                            displayName: "Step In Minutes",
                            type: { numeric: true }
                        }
                    }
                }
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
            dataPoint: {
                fill: { objectName: 'dataPoint', propertyName: 'fill' },
                width: { objectName: 'dataPoint', propertyName: 'width' },
                showAll: { objectName: 'dataPoint', propertyName: 'showAll' },
            },
            labels: {
                labelPrecision: {
                    objectName: "labels",
                    propertyName: "labelPrecision"
                }
            },
            popup: {
                showAll: {
                    objectName: "popup",
                    propertyName: "showAll"
                }
            },
            xAxis: {
                step: {
                    objectName: "xAxis",
                    propertyName: "step"
                }
            }
        };

        private static DefaultSettings: PulseChartSettings = {
            precision: 0,
            popup: {
                showAll: true
            },
            dataPoint: {
                fill: "#3779B7",
                width: 2,
                showAll: true
            },
            xAxis: {
                step: 30
            }
        };

        private static DefaultFontFamily = 'cursive';
        private static DefaultFontColor = 'rgb(165, 172, 175)';
        private static DefaultBackgroundColor = '#243C18';
        private static PaddingBetweenText = 15;

        private svg: D3.Selection;
        private chart: D3.Selection;
        private xAxis: D3.Selection;
        private yAxis: D3.Selection;

        private data: PulseChartData;

        private isFirstTime: boolean = true;

        private selectionManager: SelectionManager;
        public animator: IGenericAnimator;
        private behavior: IInteractiveBehavior;
        private colors: IDataColorPalette;

        private viewport: IViewport;
        private margin: IMargin;

        private static DefaultMargin: IMargin = {
            top: 50,
            bottom: 50,
            right: 45,
            left: 45,
        };

        private static DefaultViewport: IViewport = {
            width: 50,
            height: 50
        };

        private static DefaultTooltipSettings: TooltipSettings = {
            marginTop: 20,
            width: 100,
            height: 50,
        }

        private static MinInterval = 60 * 1000;

        private scaleType: string = AxisScale.linear;

        private static Chart: ClassAndSelector = createClassAndSelector('chart');
        private static Line: ClassAndSelector  = createClassAndSelector('line');
        private static Lines: ClassAndSelector = createClassAndSelector('lines');
        private static Node: ClassAndSelector  = createClassAndSelector('node');
        private static LineNode: ClassAndSelector = createClassAndSelector('lineNode');
        private static Axis: ClassAndSelector = createClassAndSelector('axis');
        private static Dot: ClassAndSelector  = createClassAndSelector('dot');
        private static Dots: ClassAndSelector = createClassAndSelector('dots');
        private static Tooltip: ClassAndSelector = createClassAndSelector('Tooltip');
        private static TooltipLine: ClassAndSelector = createClassAndSelector('TooltipLine');

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
            /*
            var values = dataView.categorical.values[0].values;
            var objects: DataViewObjects[] = dataView.categorical.categories[0].objects;
            var object1 = objects && objects.length > 0 ? objects[0] : undefined;
            var object2 = objects && objects.length > 1 ? objects[1] : undefined;
            var metadataObjects = dataView.metadata.objects;
            var backgroundColor = PulseChart.DefaultBackgroundColor;
            if (metadataObjects) {
                var general = metadataObjects['general'];
                if (general) {
                    var fill = <Fill>general['fill'];
                    if (fill) {
                        backgroundColor = fill.solid.color;
                    }
                }
            }
            */
            //console.log("dataView.categorical", dataView.categorical);
            //console.log("category", category);
            //console.log("categoryValues", categoryValues);
            
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
               
                var identity = hasDynamicSeries && groupedIdentity ?
                    SelectionId.createWithIdAndMeasure(groupedIdentity.identity, column.source.queryName) :
                    SelectionId.createWithMeasure(column.source.queryName);
                var key = identity.getKey();
                var color = settings.dataPoint.fill;//PulseChartChart.getColor(colorHelper, hasDynamicSeries, values, grouped, seriesIndex, groupedIdentity);
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

                for (var categoryIndex = 0, seriesCategoryIndex = 0, len = column.values.length; categoryIndex < len; categoryIndex++, seriesCategoryIndex++) {
                    var categoryValue = categoryValues[categoryIndex];
                    var value = AxisHelper.normalizeNonFiniteNumber(column.values[categoryIndex]);
                    
                    //console.log("Category index:", categoryIndex, "category value", value);
                    
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
                        });
                        seriesCategoryIndex = 0;
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
                        y0 = -1 * y0_group.values[categoryIndex];
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
                    
                    if (eventTitleValues[categoryIndex] ||
                        eventDescriptionValues[categoryIndex]) {
                           tooltipInfo = TooltipBuilder.createTooltipInfo(formatStringProp, null /*categorical*/, categoryValue, null, categoryColumns, seriesData, null);                                          
                        } 
                        
                        
                    var dataPoint: PulseChartDataPoint = {
                        categoryValue: isDateTime && categoryValue ? categoryValue.getTime() : categoryValue,
                        value: value,
                        categoryIndex: categoryIndex,
                        seriesIndex: seriesIndex,
                        tooltipInfo: tooltipInfo,
                        selected: false,
                        identity: identity,
                        key: JSON.stringify({ ser: key, catIdx: categoryIndex }),
                        labelFill: dataPointLabelSettings.labelColor,
                        labelFormatString: labelFormatString || valuesMetadata.format,
                        labelSettings: dataPointLabelSettings,
                        y: y0,
                        //y1: y1,
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
            //console.log('newValue', newValue, 'oldValue', oldValue);
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
            var svg: D3.Selection = this.svg = d3.select(options.element.get(0)).append('svg');
            svg.attr('class', 'pulseChart');

            var chart: D3.Selection = this.chart = svg.append('g').attr('class', PulseChart.Chart.class);
            /*
            chart.append('g').attr('class', PulseChart.Lines.class);
            chart.append('g').attr('class', PulseChart.Dots.class);
            */
            var xAxis: D3.Selection = this.xAxis = svg.append('g').attr('class', 'x axis');
            var yAxis: D3.Selection = this.yAxis = svg.append('g').attr('class', 'y axis');

            var style: IVisualStyle = options.style;

            this.colors = style && style.colorPalette
                ? style.colorPalette.dataColors
                : new DataColorPalette();
        }

        public update(options: VisualUpdateOptions): void {
            if (!options.dataViews || !options.dataViews[0]) {
                return;
            }
            this.updateInternal(options);
        }
        
        public updateInternal(options: VisualUpdateOptions): void {
            var dataView: DataView = options.dataViews[0];
            if (!dataView ||
                !dataView.categorical ||
                !dataView.categorical.values ||
                !dataView.categorical.values[0] ||
                !dataView.categorical.values[0].values) {
                    return;
            }

            var categoryType: ValueType = ValueType.fromDescriptor({ text: true });
            var axisType = PulseChart.Properties["general"]["formatString"];
            var isScalar: boolean =  CartesianChart.getIsScalar(dataView.metadata ? dataView.metadata.objects : null, axisType, categoryType);
            
            this.setSize(options.viewport); 
            var data: PulseChartData = this.data = this.converter(dataView, isScalar);
            //console.log('data:', data);
            if (!data) {
                return;
            }
            //var duration = options.suppressAnimations ? 0 : AnimatorCommon.MinervaAnimationDuration;
            //this.draw(data, duration, options.viewport);
            var axes: IAxisProperties[] = this.calculateAxesProperties(null);
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
            this.chart.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top));
            this.yAxis.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top));
            this.xAxis.attr('transform', SVGUtil.translate(this.margin.left, this.margin.top + (this.viewport.height / 2)));
        }
        
        public calculateAxesProperties(options: CalculateScaleAndDomainOptions): IAxisProperties[] {

            this.data.xAxisProperties = this.getXAxisProperties();
            this.data.yAxisProperties = this.getYAxisProperties();
            
            return [this.data.xAxisProperties, this.data.yAxisProperties];
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
            }
            var result: number[][] = data.map(item => {
                return item.data.map(d => d.categoryIndex);
            })
            return xDomain;
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
                origCatgSize: number = data.series && data.series.length > 0 ? data.series[0].data.length : 0,
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
                forcedTickCount: 3,
                useTickIntervalForDisplayUnits: true,
                getValueFn: (index, type) => data.categories[index],
                categoryThickness: categoryThickness,
                isCategoryAxis: false,
                scaleType: this.scaleType,
                axisDisplayUnits: undefined,
                axisPrecision: undefined
            });

            properties.axis = this.createAxisX(data.categories, this.viewport.width, formatString, this.data.settings.xAxis.step);

            return properties;
        }

        private createAxisX(dates: Date[], width: number, formatString: string, step: number = 30): D3.Svg.Axis {
            var formatter: IValueFormatter,
                timeScale: D3.Scale.TimeScale;

            formatter = valueFormatter.create({
                format: formatString,
                value: dates[0],
                value2: dates[dates.length - 1]
            });

            timeScale = d3.time.scale()
                .domain([dates[0], dates[dates.length - 1]])
                .rangeRound([0, this.viewport.width]);

            return d3.svg.axis()
                .scale(timeScale)
                .ticks(d3.time.minute, step)
                .tickFormat((value: Date) => {
                    return formatter.format(value);
                });
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
            
            var min = Math.min(minY0, -1 * maxY0);
            //console.log('min', min, 'min', minY0, 'max', maxY0);
            return [min, maxY0];
        }

        private getYAxisProperties(): IAxisProperties {
            var yDomain = PulseChart.createValueDomain(this.data.series, false);
            var lowerMeasureIndex = 0;//this.data.series.length === 1 ? 0 : this.data.lowerMeasureIndex;
            var yMetaDataColumn: DataViewMetadataColumn  = this.data.series.length? this.data.series[lowerMeasureIndex].yCol : undefined;
            var yAxisProperties = AxisHelper.createAxis({
                pixelSpan: this.viewport.height,
                dataDomain: yDomain,
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
                this.clearChart();
                return;
            }

            this.renderAxis(data, duration);
            this.renderChart(data, duration);
            
            /*
            
            //calculateLegend
            var legendData = this.createLegendDataPoints(0);

            if (data.settings && data.settings.legend) {
                LegendData.update(legendData, data.settings.legend);
                this.legend.changeOrientation(data.settings.legend.position);
            }
            var isDrawLegend = false;
            
            if (isDrawLegend) {
                this.legend.drawLegend(legendData, this.viewport);
            }
            */
            return result;
        }
        
        private renderAxis(data: PulseChartData, duration: number): void {
            var xAxis: D3.Svg.Axis = data.xAxisProperties.axis,
                yAxis: D3.Svg.Axis = data.yAxisProperties.axis,
                ticksSelection: D3.Selection,
                ticksUpdateSelection: D3.UpdateSelection,
                domainElement: Element;

            var getWidth: (element: HTMLElement) => number = function (element: HTMLElement): number {
                return (<any> d3.select(element.parentNode).select("text").node()).getBBox().width + 10;
            };

            xAxis.orient('bottom');
            yAxis.orient('left');

            this.xAxis
                .transition()
                .duration(duration)
                .call(xAxis);

            ticksSelection = this.xAxis.selectAll(".tick");

            ticksUpdateSelection = ticksSelection
                .selectAll(".axisBox")
                .data([[]]);

            ticksUpdateSelection
                .enter()
                .insert("rect", "text")
                .attr({
                    x: function () {
                        return -getWidth(<HTMLElement> this) / 2;
                    },
                    y: "-0.7em",
                    width: function () {
                        return getWidth(<HTMLElement> this);
                    },
                    height: "1.3em"
                })
                .classed("axisBox", true);

            ticksUpdateSelection
                .exit()
                .remove();

            this.xAxis
                .selectAll("text")
                .attr({
                    dy: "-0.2em"
                });

            var domainElement = this.xAxis.select(".domain").node();
            domainElement.parentNode.insertBefore(domainElement, domainElement.parentNode.firstChild);

/*
            this.yAxis
                .transition()
                .duration(duration)
                .call(yAxis);*/
        }
  
          private renderChart(data: PulseChartData, duration: number): void {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                sm = this.selectionManager;

            var selection = this.chart.selectAll(PulseChart.LineNode.selector).data(series);
 
            selection
                .enter()
                .append('g')
                .classed(PulseChart.LineNode.class, true);
                        
            this.drawLines(selection, data, duration);
            this.drawDots(selection, data, duration);
            this.drawTooltipLines(selection, data, duration);
            this.drawTooltips(selection, data, duration);
            /*
            var lineSelection = selection.selectAll(PulseChart.Line.selector).data(d => [d]);
            lineSelection
                .enter()
                .append('path');
            lineSelection
                .classed(PulseChart.Line.class, true)    
                .attr('fill', "none")///(d: PulseChartSeries) => d.color)
                .attr('stroke', (d: PulseChartSeries) => d.color)
                .attr('d', d => line(d.data))
                .attr('stroke-width', "2px");
                /*.style('fill-opacity', PulseChart.DimmedFillOpacity)
                .on('click', function(d: PulseChartSeries) {
                    sm.select(d.identity).then(ids => {
                        if (ids.length > 0) {
                            selection.style('fill-opacity', PulseChart.DimmedFillOpacity);
                            d3.select(this).transition()
                                .duration(duration)
                                .style('fill-opacity', PulseChart.FillOpacity);
                        } else {
                            selection.style('fill-opacity', PulseChart.DimmedFillOpacity);
                        }
                    });
                    d3.event.stopPropagation();
                });*/
                        
            selection.exit().remove();
            //this.renderTooltip(selection, xScale, data.isScalar);
        }
        
        private drawLines(rootSelection: D3.UpdateSelection, data: PulseChartData, duration: number) {
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

            var selection: D3.UpdateSelection = rootSelection.selectAll(node.selector).data(d => [d]);
            selection
                .enter()
                .append('path');
            selection
                .classed(node.class, true)    
                .attr('fill', "none")///(d: PulseChartSeries) => d.color)
                .attr('stroke', (d: PulseChartSeries) => d.color)
                .attr('d', d => line(d.data))
                .attr('stroke-width', "2px");

             selection.exit().remove();
        }

        private drawDots(rootSelection: D3.UpdateSelection, data: PulseChartData, duration: number) {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                node: ClassAndSelector = PulseChart.Dot,
                sm = this.selectionManager;
                            
            var selection: D3.UpdateSelection = rootSelection.selectAll(node.selector).data(d => d.data);
            selection.enter()
                        .append("circle")
                        .classed(node.class, true);
            selection
                        .attr("display", (d: PulseChartDataPoint) => {
                             //console.log('dot', new Date(d.categoryValue), d.categoryIndex, d.tooltipInfo);
                             return (d.tooltipInfo) ? "inherit" : "none";
                        })
                        .attr("cx", (d: PulseChartDataPoint) => {
                                       return xScale(isScalar ? d.categoryValue : d.categoryIndex);
                                    })
                        .attr("cy", (d: PulseChartDataPoint) => yScale(d.y))
                        .attr("r", 5)
                        .style("fill", "#8C8D8D")
                        .style("cursor", "pointer");
             
             selection.exit().remove();
        }
  
        private drawTooltipLines(rootSelection: D3.UpdateSelection, data: PulseChartData, duration: number) {
            var series: PulseChartSeries[] = data.series,
                isScalar: boolean = data.isScalar,
                xScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.xAxisProperties.scale,
                yScale: D3.Scale.LinearScale = <D3.Scale.LinearScale>data.yAxisProperties.scale,
                node: ClassAndSelector = PulseChart.Tooltip,
                sm = this.selectionManager;

            var line: D3.Svg.Line = d3.svg.line()
                .x(d => d.x)
                .y(d => d.y);

            var tooltipLine: D3.Svg.Line = d3.svg.line()
                .x(d => d.x)
                .y(d => d.y);

            var marginTop: number = PulseChart.DefaultTooltipSettings.marginTop;   
            var width: number = PulseChart.DefaultTooltipSettings.width;   
            var height: number = PulseChart.DefaultTooltipSettings.height;   

            var selection: D3.UpdateSelection = rootSelection.selectAll(node.selector).data(d => d.data);

            selection.enter()
                        .append("path")
                        .classed(node.class, true);
            selection
                        .attr("display", (d: PulseChartDataPoint) => {
                            return (d.tooltipInfo) ? "inherit" : "none";
                        })
                        .attr('fill', "#8C8D8D")//(d: PulseChartSeries) => d.color)
                        .attr('stroke', "#8C8D8D")//(d: PulseChartSeries) => d.color)
                        .attr('d', (d: PulseChartDataPoint) => { 
                            var path = [
                                {
                                    "x": xScale(isScalar ? d.categoryValue : d.categoryIndex) - width / 2,
                                    "y": (d.y > 0) ? (-1 * marginTop) : this.viewport.height + marginTop,
                                },
                                {
                                    "x": xScale(isScalar ? d.categoryValue : d.categoryIndex) - width / 2,
                                    "y": (d.y > 0) ? (-1 * (marginTop + height)) : this.viewport.height + marginTop + height,
                                },
                                {
                                    "x": xScale(isScalar ? d.categoryValue : d.categoryIndex) + width / 2,
                                    "y": (d.y > 0) ? (-1 * (marginTop + height)) : this.viewport.height + marginTop + height,
                                },
                                {
                                    "x": xScale(isScalar ? d.categoryValue : d.categoryIndex) + width / 2,
                                    "y": (d.y > 0) ? (-1 * marginTop) : this.viewport.height + marginTop,
                                }
                            ];

                            return line(path);
                          })
                        .attr('stroke-width', "1px");
                        
             selection.exit().remove();
        }

        private drawTooltips(rootSelection: D3.UpdateSelection, data: PulseChartData, duration: number) {
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
            var width: number = PulseChart.DefaultTooltipSettings.width;   
            var height: number = PulseChart.DefaultTooltipSettings.height;   
               
            var selection: D3.UpdateSelection = rootSelection.selectAll(node.selector).data(d => d.data);
            selection.enter()
                        .append("path")
                        .classed(node.class, true);
            selection
                     /*   .attr("display", (d: PulseChartDataPoint) => {
                            return (d.tooltipInfo) ? "inherit" : "none";
                        })*/
                        .attr('fill', "none")///(d: PulseChartSeries) => d.color)
                        .attr('stroke', "#8C8D8D")//(d: PulseChartSeries) => d.color)
                        .attr('d', (d: PulseChartDataPoint) => { 
                            var path = [
                                { 
                                  "x": xScale(isScalar ? d.categoryValue : d.categoryIndex),
                                  "y": yScale(d.y),
                                },
                                { 
                                  "x": xScale(isScalar ? d.categoryValue : d.categoryIndex),
                                  "y": (d.y > 0) ? (-1 * marginTop) : this.viewport.height + marginTop,
                                }];
                            return line(path);
                          })
                        .attr('stroke-width', "1px");
                        
             selection.exit().remove();
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
                objects: DataViewObjects;

            //settings.displayName = PulseChart.DefaultSettings.displayName;
            //settings.fillColor = PulseChart.DefaultSettings.fillColor;
            objects = PulseChart.getObjectsFromDataView(dataView);

            /*
            settings.precision = PulseChart.getPrecision(objects);

            settings.legend = PulseChart.getLegendSettings(objects);
            settings.colors = PulseChart.getDataColorsSettings(objects);*/

            settings.popup = PulseChart.getPopupSettings(objects);
            settings.xAxis = PulseChart.getAxisXSettings(objects);
            settings.dataPoint = this.getDataPointSettings(objects);
            
            return settings;
        }

        private static getPopupSettings(objects: DataViewObjects): PulseChartPopup {
            var showAll = DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["popup"]["showAll"],
                PulseChart.DefaultSettings.popup.showAll);
            return {
                showAll
            };
        }

        private getDataPointSettings(objects: DataViewObjects): PulseChartDataPointSetting {
            var showAll = DataViewObjects.getValue<boolean>(
                objects,
                PulseChart.Properties["dataPoint"]["showAll"],
                PulseChart.DefaultSettings.dataPoint.showAll);

            var width = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["dataPoint"]["width"],
                PulseChart.DefaultSettings.dataPoint.width);

            var colorHelper = new ColorHelper(
                this.colors,
                PulseChart.Properties["dataPoint"]["fill"],
                PulseChart.DefaultSettings.dataPoint.fill);

            var fill = colorHelper.getColorForMeasure(objects, "");

            return {
                showAll,
                width,
                fill
            };
        }

        private static getAxisXSettings(objects: DataViewObjects): PulseChartXAxisSettings {
            var xAxisSettings: PulseChartXAxisSettings = <PulseChartXAxisSettings> {};

            xAxisSettings.step = DataViewObjects.getValue<number>(
                objects,
                PulseChart.Properties["xAxis"]["step"],
                PulseChart.DefaultSettings.xAxis.step);

            return xAxisSettings;
        }
/*
        private getRecomendedFontProperties(text1: string, text2: string, parentViewport: IViewport): TextProperties {
            var textProperties: TextProperties = {
                fontSize: '',
                fontFamily: PulseChart.DefaultFontFamily,
                text: text1 + text2
            };

            var min = 1;
            var max = 1000;
            var i;
            var maxWidth = parentViewport.width;
            var width = 0;

            while (min <= max) {
                i = (min + max) / 2 | 0;

                textProperties.fontSize = i + 'px';
                width = TextMeasurementService.measureSvgTextWidth(textProperties);

                if (maxWidth > width)
                    min = i + 1;
                else if (maxWidth < width)
                    max = i - 1;
                else
                    break;
            }

            textProperties.fontSize = i + 'px';
            width = TextMeasurementService.measureSvgTextWidth(textProperties);
            if (width > maxWidth) {
                i--;
                textProperties.fontSize = i + 'px';
            }

            return textProperties;
        }

        private calculateLayout(data: PulseChartData, viewport: IViewport): PulseChartLayout {
            var text1 = data.teamA.name;
            var text2 = data.teamB.name;

            var avaliableViewport: IViewport = {
                height: viewport.height,
                width: viewport.width - PulseChart.PaddingBetweenText
            };
            var recomendedFontProperties = this.getRecomendedFontProperties(text1, text2, avaliableViewport);

            recomendedFontProperties.text = text1;
            var width1 = TextMeasurementService.measureSvgTextWidth(recomendedFontProperties) | 0;

            recomendedFontProperties.text = text2;
            var width2 = TextMeasurementService.measureSvgTextWidth(recomendedFontProperties) | 0;

            var padding = ((viewport.width - width1 - width2 - PulseChart.PaddingBetweenText) / 2) | 0;

            recomendedFontProperties.text = text1 + text2;
            var offsetHeight = (TextMeasurementService.measureSvgTextHeight(recomendedFontProperties)) | 0;

            var max = data.teamA.value + data.teamB.value;
            var availableHeight = viewport.height - offsetHeight;
            var y1 = (((max - data.teamA.value) / max) * availableHeight + offsetHeight / 2) | 0;
            var y2 = (((max - data.teamB.value) / max) * availableHeight + offsetHeight / 2) | 0;

            return {
                x1: padding,
                x2: padding + width1 + PulseChart.PaddingBetweenText,
                y1: y1,
                y2: y2,
                fontSize: recomendedFontProperties.fontSize
            };
        }

        private ensureStartState(layout: PulseChartLayout, viewport: IViewport) {
            if (this.isFirstTime) {
                this.isFirstTime = false;
                var startY = viewport.height / 2;
                this.textOne.attr(
                    {
                        'x': layout.x1,
                        'y': startY
                    });

                this.textTwo.attr(
                    {
                        'x': layout.x2,
                        'y': startY
                    });
            }
        }

        private clearSelection() {
            this.selectionManager.clear().then(() => {
                this.clearSelectionUI();
            });
        }

        private clearSelectionUI() {
            this.textOne.style('stroke', '#FFF').style('stroke-width', 0);
            this.textTwo.style('stroke', '#FFF').style('stroke-width', 0);
        }

        private updateSelectionUI(ids: SelectionId[]) {
            this.textOne.style('stroke', '#FFF').style('stroke-width', SelectionManager.containsSelection(ids, this.data.teamA.identity) ? '2px' : '0px');
            this.textTwo.style('stroke', '#FFF').style('stroke-width', SelectionManager.containsSelection(ids, this.data.teamB.identity) ? '2px' : '0px');
        }

        private draw(data: PulseChartData, duration: number, viewport: IViewport) {
            var easeName = 'back';
            var textOne = this.textOne;
            var textTwo = this.textTwo;

            this.svg
                .attr({
                    'height': viewport.height,
                    'width': viewport.width
                })
                .on('click', () => {
                    this.clearSelection();
                })
                .style('background-color', data.background);

            var layout = this.calculateLayout(data, viewport);

            this.ensureStartState(layout, viewport);

            textOne
                .style('font-size', layout.fontSize)
                .style('fill', data.teamA.color)
                .on('click', () => {
                    this.selectionManager.select(data.teamA.identity, d3.event.ctrlKey).then((ids) => {
                        this.updateSelectionUI(ids);
                    });
                    d3.event.stopPropagation();
                })
                .text(data.teamA.name);

            textTwo
                .style('font-size', layout.fontSize)
                .style('fill', data.teamB.color)
                .on('click', () => {
                    this.selectionManager.select(data.teamB.identity, d3.event.ctrlKey).then((ids) => {
                        this.updateSelectionUI(ids);
                    });
                    d3.event.stopPropagation();
                })
                .text(data.teamB.name);

            textOne.transition()
                .duration(duration)
                .ease(easeName)
                .attr({
                    y: layout.y1,
                    x: layout.x1
                });

            textTwo.transition()
                .duration(duration)
                .ease(easeName)
                .attr({
                    y: layout.y2,
                    x: layout.x2
                });
        }

        public destroy(): void {
            this.svg = null;
        }
        */
        
        private clearChart(): void {
        //    this.chart.selectAll('*').remove();
          //  this.axisY.selectAll('*').remove();
            //this.xAxis.selectAll('*').remove();
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
                case "dataPoint": {
                    this.readDataPointInstance(enumeration);
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
                    showAll: popupSettings.showAll
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
                    step: xAxisSettings.step
                }
            });
        }

        private readDataPointInstance(enumeration: ObjectEnumerationBuilder): void {
            var dataPointSettings: PulseChartDataPointSetting = this.data.settings.dataPoint;

            if (!dataPointSettings) {
                dataPointSettings = PulseChart.DefaultSettings.dataPoint;
            }

            var dataPoint: VisualObjectInstance = {
                objectName: "dataPoint",
                displayName: "dataPoint",
                selector: null,
                properties: {
                    fill: dataPointSettings.fill,
                    width: dataPointSettings.width,
                    showAll: dataPointSettings.showAll
                }
            };

            enumeration.pushInstance(dataPoint);
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
