<template>
    <div class="screen-container">
        <header class="screen-header">
            <div>
                <img src="../../public/static/img/header_border_dark.png" alt="">
            </div>
            <span class="logo">
                <img src="../../public/static/img/logo_dark.png" alt="">
            </span>
            <span>电商平台实时监控系统</span>
            <div class="title-right">
                <img src="../../public/static/img/qiehuan_dark.png" alt="" class="qiehuan" @click='handleChangeTheme'>
                <span class="datetime"></span>
            </div>
        </header>
        <div class="screen-body">
            <section class="screen-left">
                <div id="left-top" :class="[fullscreenStatus.trend?'fullscreen':'']">
                    <!-- 销量趋势表 -->
                    <Trend ref='trend' />
                    <div class="resize">
                        <span @click="changeSize('trend')"><i :class="[fullscreenStatus.trend?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
                <div id="left-bottom" :class="[fullscreenStatus.seller?'fullscreen':'']">
                    <!-- 商家销售金额表 -->
                    <Seller ref='seller' />
                    <div class="resize">
                        <span @click="changeSize('seller')"><i :class="[fullscreenStatus.seller?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
            </section>
            <section class="screen-middle">
                <div id="middle-top" :class="[fullscreenStatus.map?'fullscreen':'']">
                    <!-- 商家分布表 -->
                    <Map ref='map' />
                    <div class="resize">
                        <span @click="changeSize('map')"><i :class="[fullscreenStatus.map?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
                <div id="middle-bottom" :class="[fullscreenStatus.rank?'fullscreen':'']">
                    <!-- 地区销量排行表 -->
                    <Rank ref='rank' />
                    <div class="resize">
                        <span @click="changeSize('rank')"><i :class="[fullscreenStatus.rank?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
            </section>
            <section class="screen-right">
                <div id="right-top" :class="[fullscreenStatus.hot?'fullscreen':'']">
                    <!-- 热销商品 -->
                    <Hot ref='hot' />
                    <div class="resize">
                        <span @click="changeSize('hot')"><i :class="[fullscreenStatus.hot?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
                <div id="right-bottom" :class="[fullscreenStatus.stock?'fullscreen':'']">
                    <Stock ref='stock' />
                    <div class="resize">
                        <span @click="changeSize('stock')"><i :class="[fullscreenStatus.stock?'el-icon-zoom-out':'el-icon-zoom-in']"></i></span>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>
<script>
import Hot from '../components/Hot.vue'
import Map from '../components/Map.vue'
import Rank from '../components/Rank.vue'
import Seller from '../components/Seller.vue'
import Stock from '../components/Stock.vue'
import Trend from '../components/Trend.vue'

export default {
    components: {
        Hot,
        Map,
        Rank,
        Seller,
        Stock,
        Trend
    },
    data() {
        return {
            fullscreenStatus: {
                trend: false,
                stock: false,
                map: false,
                seller: false,
                hot: false,
                rank: false,
            }
        }
    },
    created() {
        this.$socket.registerCallBack('fullScreen', this.recvData)
        this.$socket.registerCallBack('themeChange', this.recvThemeChange)

    },
    destroyed() {
        this.$socket.unRegisterCallBack('fullScreen')
        this.$socket.unRegisterCallBack('themeChange')
    },
    methods: {
        changeSize(chartName) {
            // 1.改变fullscreenStatus的数据
            // this.fullscreenStatus[chartName] = !this.fullscreenStatus[chartName]
            // 2.手动调用每一个图标组件的screenAdapter方法
            // this.$refs[chartName].screenAdapter()
            // this.$nextTick(() => {
            //     this.$refs[chartName].screenAdapter()
            // })
            // 
            const targetValue = !this.fullscreenStatus[chartName]
            this.$socket.send({
                action: 'fullScreen',
                socketType: 'fullScreen',
                chartName: chartName,
                value: targetValue
            })
        },
        // 接收到全屏数据后的处理
        recvData(data) {
            const chartName = data.chartName
            const targetValue = data.value
            this.fullscreenStatus[chartName] = targetValue
            this.$nextTick(() => {
                this.$refs[chartName].screenAdapter()
            })
        },
        handleChangeTheme() {
            // this.$store.commit('changeTheme')
            this.$socket.send({
                action: 'themeChange',
                socketType: 'themeChange',
                chartName: '',
                value: ''
            })
        },
        recvThemeChange() {
            this.$store.commit('changeTheme')
        }
    }

}
</script>
<style lang="less" scoped="">
.fullscreen {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    z-index: 100;
}

.screen-container {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    background-color: #161522;
    color: #fff;
    box-sizing: border-box;
}

.screen-header {
    width: 100%;
    height: 64px;
    font-size: 20px;
    position: relative;

    >div {
        img {
            width: 100%;
        }
    }

    .title {
        position: absolute;
        left: 50%;
        top: 50%;
        font-size: 20px;
        transform: translate(-50%, -50%);
    }

    .title-right {
        display: flex;
        align-items: center;
        position: absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-80%);
    }

    .qiehuan {
        width: 28px;
        height: 21px;
        cursor: pointer;
    }

    .datetime {
        font-size: 15px;
        margin-left: 10px;
    }

    .logo {
        position: absolute;
        left: 0px;
        top: 50%;
        transform: translateY(-80%);

        img {
            height: 35px;
            width: 128px;
        }
    }
}

.screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;

    .screen-left {
        height: 100%;
        width: 27.6%;

        #left-top {
            height: 53%;
            position: relative;
        }

        #left-bottom {
            height: 31%;
            margin-top: 25px;
            position: relative;
        }
    }

    .screen-middle {
        height: 100%;
        width: 41.5%;
        margin-left: 1.6%;
        margin-right: 1.6%;

        #middle-top {
            width: 100%;
            height: 56%;
            position: relative;
        }

        #middle-bottom {
            margin-top: 25px;
            width: 100%;
            height: 28%;
            position: relative;
        }
    }

    .screen-right {
        height: 100%;
        width: 27.6%;

        #right-top {
            height: 46%;
            position: relative;
        }

        #right-bottom {
            height: 38%;
            margin-top: 25px;
            position: relative;
        }
    }
}

.resize {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
}
</style>