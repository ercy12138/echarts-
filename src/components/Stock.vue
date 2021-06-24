<template>
    <div class="com_container">
        <div class="com_chart" ref='stock_chart'>
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
            currentIndex: 0,
            timerId: null
        }
    },
    created() {
        this.$socket.registerCallBack('stockData', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'stockData',
            chartName: 'stock',
            value: ''
        })
        this.screenAdapter()
        window.addEventListener('resize', this.screenAdapter)
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        clearInterval(this.timerId)
        this.$socket.unRegisterCallBack('stockData')
    },
    methods: {
        async initChart() {
            this.mChart = this.$echarts.init(this.$refs.stock_chart, this.theme)
            const initOption = {
                title: {
                    text: '▎ 库存销售量',
                    top: 20,
                    left: 20
                }
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
            // const { data: ret } = await this.$http.get('stock')
            // console.log(ret)
            this.allData = ret;
            this.startInterval()
            this.updateChart()
        },
        updateChart() {
            //处理数据
            const centerArr = [
                ['18%', '40%'],
                ['50%', '40%'],
                ['82%', '40%'],
                ['34%', '75%'],
                ['66%', '75%']
            ]
            const colorArr = [
                ['#4FF778', '#0BA82C'],
                ['#E5DD45', '#E8B11C'],
                ['#E8821C', '#E55445'],
                ['#5052EE', '#AB6EE5'],
                ['#23E5E5', '#2E72BF']
            ]
            const startIndex = this.currentIndex * 5
            const endIndex = (this.currentIndex + 1) * 5
            const showData = this.allData.slice(startIndex, endIndex)
            const seriesArr = showData.map((item, index) => {
                return {
                    type: 'pie',
                    center: centerArr[index],
                    hoverAnimation: false,
                    label: {
                        show: true,
                        position: 'center',
                        color: colorArr[index][0],
                    },
                    data: [{
                        name: item.name + '\n' + item.sales,
                        value: item.sales,
                        itemStyle: {
                            color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [{
                                    offset: 0,
                                    color: colorArr[index][0]
                                },
                                {
                                    offset: 1,
                                    color: colorArr[index][1]
                                }
                            ])
                        }
                    }, {
                        // name: item.name + '\n' + item.stock,
                        value: item.stock,
                        itemStyle: {
                            color: '#333843'
                        }
                    }]
                }
            })
            const dataOption = {
                series: seriesArr
            }
            this.mChart.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = this.$refs.stock_chart.offsetWidth / 100 * 3.6
            const innerRadius = titleFontSize * 2
            const outterRadius = innerRadius * 1.125
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize
                    }
                },
                series: [{
                    type: 'pie',
                    radius: [outterRadius, innerRadius],
                    label: {
                        fontSize: titleFontSize / 2
                    }
                }, {
                    type: 'pie',
                    radius: [outterRadius, innerRadius],
                    label: {
                        fontSize: titleFontSize / 2
                    }
                }, {
                    type: 'pie',
                    radius: [outterRadius, innerRadius],
                    label: {
                        fontSize: titleFontSize / 2
                    }
                }, {
                    type: 'pie',
                    radius: [outterRadius, innerRadius],
                    label: {
                        fontSize: titleFontSize / 2
                    }
                }, {
                    type: 'pie',
                    radius: [outterRadius, innerRadius],
                    label: {
                        fontSize: titleFontSize / 2
                    }
                }]
            }
            this.mChart.setOption(adapterOption)
            this.mChart.resize()
        },
        startInterval() {
            this.timerId = setInterval(() => {
                this.currentIndex++
                if (this.currentIndex > 1) {
                    this.currentIndex = 0
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