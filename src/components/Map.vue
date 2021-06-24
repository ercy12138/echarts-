<template>
    <div class="com_container" @dblclick='revertMap'>
        <div class="com_chart" ref='map_chart'>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import { getProvinceMapInfo } from '../utils/map_utils.js';
import { mapState } from 'vuex'

export default {
    data() {
        return {
            mChart: null,
            allData: [],
            mapData: {} //所获取的省份地图的矢量数据缓存
        }
    },
    created() {
        this.$socket.registerCallBack('mapData', this.getData)
    },
    mounted() {
        this.initChart()
        this.$socket.send({
            action: 'getData',
            socketType: 'mapData',
            chartName: 'map',
            value: ''
        })
        this.screenAdapter()
        window.addEventListener('resize', this.screenAdapter)
    },
    destroyed() {
        this.$socket.unRegisterCallBack('mapData')
    },
    methods: {
        async initChart() {
            this.mChart = this.$echarts.init(this.$refs.map_chart, this.theme);

            // 获取中国地图的矢量数据
            // http://127.0.0.1:8999/static/map/china.json
            // china.json并不是位于koa2后台的数据。this.$http是已经配置了的axios，不能直接使用this.$http获取该数据
            const ret = await axios.get('http://localhost:8999/static/map/china.json')
            // console.log(ret)
            // console.log('asd')
            // 
            // 初始化地图
            // 注册地图
            this.$echarts.registerMap('china', ret.data)
            const initOption = {
                title: {
                    text: '▎ 商户分布',
                    top: 20,
                    left: 20
                },
                legend: {
                    left: 20,
                    bottom: 20,
                    orient: 'vertical'
                },
                geo: {
                    type: 'map',
                    map: 'china',
                    top: '5%',
                    bottom: '5%',
                    itemStyle: {
                        areaColor: '#2e72bf',
                        borderColor: '#333'
                    }
                }
            }
            this.mChart.setOption(initOption)

            //获取省份的信息
            this.mChart.on('click', async (arg) => {
                // console.log(arg)
                const provinceInfo = getProvinceMapInfo(arg.name)
                // console.log(ret)
                if (!this.mapData[provinceInfo.key]) {
                    const ret = await axios.get('http://localhost:8999' + provinceInfo.path)
                    this.mapData[provinceInfo.key] = ret.data
                    this.$echarts.registerMap(provinceInfo.key, ret.data)
                }
                const changeOption = {
                    geo: {
                        map: provinceInfo.key
                    }
                }
                this.mChart.setOption(changeOption)
            })

        },
        getData(ret) {
            // console.log(ret)
            this.allData = ret
            this.updateChart()
        },
        updateChart() {
            const legendArr = this.allData.map(item => {
                return item.name
            })
            const seriesArr = this.allData.map(item => {
                return {
                    type: 'effectScatter',
                    name: item.name,
                    data: item.children,
                    //坐标系设置为地图坐标系，以正确显示散点
                    coordinateSystem: 'geo',
                    rippleEffect: {
                        scale: 5,
                        brushType: 'stroke'
                    }
                }
            })
            const dataOption = {
                legend: {
                    data: legendArr
                },
                series: seriesArr
            }
            this.mChart.setOption(dataOption)
        },
        screenAdapter() {
            const titleFontSize = this.$refs.map_chart.offsetWidth / 100 * 3.6
            const adapterOption = {
                title: {
                    textStyle: {
                        fontSize: titleFontSize
                    }
                },
                legend: {
                    itemWidth: titleFontSize / 2,
                    itemHeight: titleFontSize / 2,
                    itemGap: titleFontSize / 2,
                    textStyle: {
                        fontSize: titleFontSize / 2
                    }
                }
            }
            this.mChart.setOption(adapterOption)
            //必不可少的一步：手动调用echart实例的resize()方法
            this.mChart.resize()
        },
        revertMap() {
            const revertOption = {
                geo: {
                    map: 'china'
                }
            }
            this.mChart.setOption(revertOption)
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