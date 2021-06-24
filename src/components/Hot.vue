<template>
    <div class="com_container">
        <div class="com_chart" ref='hot_chart'>
        </div>
        <span class="prev" @click='prev'>&lt;</span>
        <span class="next" @click='next'>&gt;</span>
        <span class="title" :style='comStyle'>{{catName}}</span>
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
            catName: '',
            myFontSize: 0
        }
    },
    computed: {
        comStyle() {
            return {
                fontSize: this.myFontSize + 'px',
                width: this.myFontSize + 'px',
                height: this.myFontSize + 'px',
            }
        },
        ...mapState(['theme'])
    },
    created() {
        this.$socket.registerCallBack('hotData', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'hotData',
            chartName: 'hotproduct',
            value: ''
        })
        this.screenAdapter()
        window.addEventListener('resize', this.screenAdapter)
    },
    destroyed() {
        window.removeEventListener('resize', this.screenAdapter)
        this.$socket.unRegisterCallBack('hotData')
    },
    methods: {
        initChart() {
            this.mChart = this.$echarts.init(this.$refs.hot_chart, this.theme)
            const initOption = {
                title: {
                    text: '▎ 热销商品的占比',
                    top: 20,
                    left: 20
                },
                legend: {
                    bottom: '4%',
                    icon: 'circle',

                },
                tooltip: {
                    show: true,
                    formatter: (arg) => {
                        // console.log(arg)
                        const thirdCategory = arg.data.children
                        let total = 0
                        thirdCategory.forEach(item => {
                            total += item.value
                        })
                        let retStr = ''
                        thirdCategory.forEach(item => {
                            retStr += `
                            ${item.name}:${parseInt(item.value/total*100)+'%'}
                            <br/>
                            `
                        })
                        return retStr;
                    }
                },
                series: [{
                    type: 'pie',
                    label: {
                        show: false
                    },
                    emphasis: {
                        label: {
                            show: true
                        }
                    },
                }]
            }
            this.mChart.setOption(initOption)
        },
        getData(ret) {
            //获取数据
            // const { data: ret } = await this.$http.get('hotproduct')
            // console.log(ret)
            this.allData = ret
            // console.log(this.allData)
            // console.log(this.allData[this.currentIndex].name)
            this.updateChart()
        },
        updateChart() {
            //处理数据
            const seriesData = this.allData[this.currentIndex].children.map(item => {
                return {
                    name: item.name,
                    value: item.value,
                    children: item.children
                }
            })
            const legendArr = this.allData[this.currentIndex].children.map(item => {
                return {
                    name: item.name
                }
            })
            this.catName = this.allData[this.currentIndex].name
            const dataOption = {
                legend: {
                    data: legendArr
                },
                series: [{
                    data: seriesData
                }]
            }
            this.mChart.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = this.$refs.hot_chart.offsetWidth / 100 * 3.6
            this.myFontSize = titleFontSize
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize
                    }
                },
                legend: {
                    itemWidth: titleFontSize,
                    itemHeight: titleFontSize,
                    textStyle: {
                        fontSize: titleFontSize / 2
                    }
                }
            }
            this.mChart.setOption(adapterOption)
            this.mChart.resize()
        },
        prev() {
            if (this.currentIndex === 0) {
                this.currentIndex = 2
            } else {
                this.currentIndex--

            }
            this.updateChart()
        },
        next() {
            if (this.currentIndex === 2) {
                this.currentIndex = 0
            } else {
                this.currentIndex++
            }

            this.updateChart()
        },
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
.prev {
    position: absolute;
    top: 50%;
    left: 7%;
    color: #ccc;
    z-index: 10;
    // font-size: 50px;
    // width: 100px;
    // height: 100px;
    transform: translateY(-50%);
    padding-top: 50px;
    // background-color: gray;
    cursor: pointer;
}

.prev:hover,
.next:hover {
    // background-color: lightgray;
    color: gray;
}

.next {
    position: absolute;
    top: 50%;
    right: 10%;
    color: #ccc;
    z-index: 10;
    // font-size: 50px;
    // width: 100px;
    // height: 100px;
    transform: translateY(-50%);
    padding-top: 50px;
    // background-color: gray;
    cursor: pointer;

}

.title {
    position: absolute;
    bottom: 13%;
    right: 15%;
    color: #ccc;

}
</style>