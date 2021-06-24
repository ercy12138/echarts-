<template>
    <div class="com_container">
        <div class="com_chart" ref='rank_chart'>
        </div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            mChart: null,
            allData: [],
            startValue: 0,
            endValue: 9,
            timerId: null
        }
    },
    created() {
        this.$socket.registerCallBack('rankData', this.getData)

    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'rankData',
            chartName: 'rank',
            value: ''
        })
        this.screenAdapter()
        window.addEventListener('resize', this.screenAdapter)
    },
    destroyed() {
        clearInterval(this.timerId)
        this.$socket.unRegisterCallBack('rankData')

    },
    methods: {
        async initChart() {
            this.mChart = this.$echarts.init(this.$refs.rank_chart, this.theme)
            const initOption = {
                title: {
                    text: "▎ 地区销售排行",
                    left: 20,
                    top: 20,
                },
                grid: {
                    top: '40%',
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    containLabel: true
                },
                tooltip: {
                    show: true
                },
                xAxis: {
                    type: 'category'
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                    type: 'bar'
                }]
            }
            this.mChart.on('mouseover', () => {
                clearInterval(this.timerId)
            })
            this.mChart.on('mouseout', () => {
                this.startInterval()
            })
            this.mChart.setOption(initOption)
        },
        async getData(ret) {
            //获取数据
            // const { data: ret } = await this.$http.get('rank')
            this.allData = ret;
            // console.log(this.allData)
            this.allData.sort((a, b) => {
                return b.value - a.value
            })
            this.updateChart()
            this.startInterval()
        },
        updateChart() {
            //处理数据
            const provinceArr = this.allData.map(item => {
                return item.name;
            })
            const valueArr = this.allData.map(item => {
                return item.value
            })
            const colorArr = [
                ['#0ba82c', '#4ff778'],
                ['#2e72bf', '#23e5e5'],
                ['#5052ee', '#ab6ee5']
            ]
            // console.log(valueArr)
            const dataOption = {
                xAxis: {
                    data: provinceArr
                },
                //平移动画的实现依赖 datazoom来实现
                //改变 startValue 与 endValue
                dataZoom: {
                    show: false,
                    startValue: this.startValue,
                    endValue: this.endValue
                },
                series: [{
                    data: valueArr,
                    itemStyle: {
                        color: (arg) => {
                            let targetColorArr = null;
                            if (arg.value > 300) {
                                targetColorArr = colorArr[0]
                            } else if (arg.value > 200) {
                                targetColorArr = colorArr[1]
                            } else {
                                targetColorArr = colorArr[2]
                            }
                            return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: targetColorArr[0]
                            }, {
                                offset: 1,
                                color: targetColorArr[1]
                            }])
                        }
                    }
                }]
            }
            this.mChart.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = this.$refs.rank_chart.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize
                    }
                },
                series: [{
                    barWidth: titleFontSize,
                    itemStyle: {
                        barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0]
                    }
                }]
            }
            this.mChart.setOption(adapterOption)
            this.mChart.resize();
        },
        startInterval() {
            this.timerId = setInterval(() => {
                this.startValue++
                this.endValue++
                if (this.endValue > this.allData.length - 1) {
                    this.startValue = 0
                    this.endValue = 9
                }
                this.updateChart()
            }, 2000)
        }
    },
    computed: {
        ...mapState(['theme'])
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
<style lang="less" scoped=""></style>