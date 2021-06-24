<template>
    <div class="com_container">
        <div class="title" :style='comStyle'>
            <span class="show-title">{{showTitle}}</span>
            <span class="down-arrow" @click='isShow=!isShow' :style='arrowSize'>▽</span>
            <div class="choice" v-show='isShow'>
                <div class="title-item" v-for='item in showDataType' :key='item.key' @click='handleSelect(item.key)'>{{item.text}}</div>
            </div>
        </div>
        <div class="com_chart" ref='trend_chart'></div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            mChart: null,
            allData: [],
            isShow: false,
            showData: 'map',
            titleFontSize: 0
        }
    },
    created() {
        this.$socket.registerCallBack('trendData', this.getData)
    },
    mounted() {
        this.initChart()

        // 向服务端发送数据
        this.$socket.send({
            action: 'getData',
            socketType: 'trendData',
            chartName: 'trend',
            value: ''
        })
        window.addEventListener('resize', this.screenAdapter)
        this.screenAdapter()
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('trendData')
    },
    computed: {
        showDataType() {
            if (!this.allData) {
                return []
            } else {
                // 不能用filter进行数据筛选，会报错 为什么？？？
                return this.allData.type
            }
        },
        showTitle() {
            return this.allData[this.showData].title
        },
        comStyle() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        },
        arrowSize() {
            return {
                fontSize: this.titleFontSize + 'px'
            }
        },
        ...mapState(['theme'])

    },
    methods: {
        initChart() {
            this.mChart = this.$echarts.init(this.$refs.trend_chart, this.theme);
            const initOption = {
                title: {
                    top: 20,
                    left: 20,
                },
                grid: {
                    top: '20%',
                    left: '3%',
                    right: '6%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false, //紧挨边缘
                },
                yAxis: {
                    type: 'value'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    top: '10%',
                    left: 20,
                    icon: 'circle',
                }
                // series: [{
                // }, ]
            };
            this.mChart.setOption(initOption)
        },
        getData(ret) {
            //await this.$http 获取数据
            // const { data: ret } = await this.$http.get('trend');
            console.log(ret)
            this.allData = ret
            // console.log(this.allData.common.month)
            this.updateChart();
        },

        updateChart() {
            // 定义填充颜色
            const colorArr1 = [
                'rgba(11,168,44,0.5)',
                'rgba(44,110,255,0.5)',
                'rgba(22,242,217,0.5)',
                'rgba(254,33,30,0.5)',
                'rgba(250,105,0,0.5)',
            ]
            const colorArr2 = [
                'rgba(11,168,44,0)',
                'rgba(44,110,255,0)',
                'rgba(22,242,217,0)',
                'rgba(254,33,30,0)',
                'rgba(250,105,0,0)',
            ]
            //处理数据
            const timeArr = this.allData.common.month;
            const valArr = this.allData[this.showData].data;
            const legendArr = valArr.map(item => {
                return item.name
            })
            var seriesArr = valArr.map((item, index) => {
                return {
                    name: item.name,
                    type: 'line',
                    data: item.data,
                    stack: 'map', //堆叠图显示
                    areaStyle: {
                        color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: colorArr1[index]
                            },
                            {
                                offset: 1,
                                color: colorArr2[index]
                            }
                        ])
                    }
                }
            })
            const dataOption = {
                xAxis: {
                    data: timeArr
                },
                legend: {
                    data: legendArr
                },
                series: seriesArr
            };
            this.mChart.setOption(dataOption)
        },
        screenAdapter() {
            this.titleFontSize = this.$refs.trend_chart.offsetWidth / 100 * 3.6
            const adapterOption = {
                legend: {
                    itemWidth: this.titleFontSize,
                    itemHeight: this.titleFontSize,
                    itemGap: this.titleFontSize,
                    textStyle: {
                        fontSize: this.titleFontSize / 2
                    }
                }
            }
            this.mChart.setOption(adapterOption)
            this.mChart.resize()
        },
        handleSelect(type) {
            this.showData = type;
            this.updateChart();
            this.isShow = false
        }
    },
    watch: {
        theme() {
            console.log('主题变化')
            this.mChart.dispose() //销毁当前的图表
            this.initChart() //重新以最新的主题名称初始化图表对象
            this.screenAdapter()
            this.updateChart()
        }
    }
}
</script>
<style lang="less" scoped="">
.title {
    position: absolute;
    left: 20px;
    top: 20px;
    z-index: 10;
    color: #ccc;
}

.down-arrow {
    margin-left: 5px;
    font-size: 25px;
    text-align: center;
    cursor: pointer;
}

.title-item {
    cursor: pointer;
}
</style>