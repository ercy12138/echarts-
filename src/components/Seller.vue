<!-- 商家销量统计的横向柱状图 -->
<template>
    <div class="com_container">
        <div class="com_chart" ref='seller_chart'></div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
export default {
    data() {
        return {
            mCharts: null,
            allData: [],
            currentPage: 1,
            totalPage: 0,
            timerId: null
        }
    },
    created() {
        this.$socket.registerCallBack('sellerData', this.getData)
    },
    mounted() {
        this.initChart();
        this.$socket.send({
            action: 'getData',
            socketType: 'sellerData',
            chartName: 'seller',
            value: ''
        })
        this.screenAdapter()
        window.addEventListener('resize', this.screenAdapter);
    },
    destoryed() {
        clearInterval(this.timeId)
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('sellerData')
    },
    methods: {
        initChart() {
            this.mCharts = this.$echarts.init(this.$refs.seller_chart, this.theme);
            this.mCharts.on('mouseover', () => {
                clearInterval(this.timerId)
            })
            this.mCharts.on('mouseout', () => {
                this.startInterval()
            })
            // 图表初始化设置
            const initOption = {
                title: {
                    text: '▏ 商家销售统计',
                    left: 20,
                    top: 20
                },
                grid: {
                    top: '20%',
                    left: '3%',
                    right: '6%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value'
                },
                yAxis: {
                    type: 'category',
                },
                tooltip: {
                    // 鼠标移动到数据上时改变背景色
                    trigger: 'axis', //移动到坐标轴上时触发
                    axisPointer: { //提示框样式
                        type: 'line',
                        z: 0,
                        lineStyle: {}
                    }
                },
                series: [{
                    type: 'bar',
                    label: {
                        show: true,
                        position: 'right',
                        textStyle: {
                            color: 'white'
                        }
                    },
                    itemStyle: {
                        color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                            offset: 0,
                            color: '#5052ee'
                        }, {
                            offset: 1,
                            color: '#ab6ee5'
                        }]),
                    }
                }, ],

            }
            this.mCharts.setOption(initOption)
        },
        async getData(ret) {
            // const { data: ret } = await this.$http.get('seller')
            // console.log(this.allData)
            this.allData = ret
            this.allData.sort((a, b) => {
                return a.value - b.value
            })
            this.totalPage = this.allData.length % 5 === 0 ? this.allData.length / 5 : this.allData.length / 5 + 1
            this.updateChart()
            this.startInterval()

        },
        updateChart() {
            const start = (this.currentPage - 1) * 5;
            const end = this.currentPage * 5;
            const showData = this.allData.slice(start, end)
            const sellerName = showData.map((item) => {
                return item.name
            })
            const sellerVal = showData.map((item) => {
                return item.value
            })

            const dataOption = {
                yAxis: {
                    data: sellerName
                },

                series: [{
                    data: sellerVal,
                }, ]

            }
            this.mCharts.setOption(dataOption);
        },
        startInterval() {
            this.timerId = setInterval(() => {
                this.currentPage++
                if (this.currentPage > this.totalPage) {
                    this.currentPage = 1;
                }
                this.updateChart();
            }, 3000)
        },
        // 屏幕适配
        screenAdapter() {
            const titleFontSize = this.$refs.seller_chart.offsetWidth / 100 * 3.6;
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize
                    },
                },

                tooltip: {
                    lineStyle: {
                        width: titleFontSize,
                    }
                },

                series: [{
                    barWidth: titleFontSize,
                    itemStyle: {
                        barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
                    }
                }, ]
            }
            this.mCharts.setOption(adapterOption)
            // 必须手动调用图表对象的resize方法才能产生效果
            this.mCharts.resize()
        }
    },
    computed: {
        ...mapState(['theme'])
    },
    watch: {
        theme() {
            console.log('主题变化')
            this.mCharts.dispose() //销毁当前的图表
            this.initChart() //重新以最新的主题名称初始化图表对象
            this.screenAdapter()
            this.updateChart()
        }
    }
}
</script>
<style lang="less" scoped=""></style>