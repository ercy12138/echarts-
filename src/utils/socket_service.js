// 定义类SocketService，并定义成单例的设计模式

export default class SocketService {
    // 单例:保证一个类仅有一个实例，并提供一个访问它的全局访问点
    static instance = null;
    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance;
    }

    // 和服务器端连接的socket对象
    ws = null;

    // 存储回调函数
    callBackMapping = {}

    // 标识是否连接成功
    connected = false
    // 记录重试的次数
    sendRetryCount = 0

    connectRetryCount = 0

    // 定义连接服务器的方法
    connect() {
        this.ws = new WebSocket('ws://localhost:9998')

        this.ws.onopen = () => {
            console.log('连接服务器端成功')
            this.connected = true
            this.connectRetryCount = 0
        }
        this.ws.onclose = () => {
            console.log('连接失败')
            this.connected = false
            this.connectRetryCount++
            setTimeout(() => {
                this.connect()
            }, 500 * this.connectRetryCount)
        }

        //得到从服务端发送过来的数据
        //接受到的数据对于该js文件是无用的，要用到数据的是vue组件
        //这就是回调函数注册的用途
        this.ws.onmessage = msg => {
            // console.log("接受数据" + msg)
            const recvData = JSON.parse(msg.data)
            const socketType = recvData.socketType
            // 判断回调函数是否存在
            if (this.callBackMapping[socketType]) {
                const action = recvData.action
                if (action === 'getData') {
                    const realData = JSON.parse(recvData.data)
                    this.callBackMapping[socketType].call(this, realData)
                } else if (action === 'fullScreen') {
                    this.callBackMapping[socketType].call(this, recvData)
                } else if (action === 'themeChange') {
                    // console.log('themeChange')
                    this.callBackMapping[socketType].call(this)

                }
            }
        }
    }

    // 回调函数注册
    registerCallBack(socketType, callBack) {
        this.callBackMapping[socketType] = callBack
    }

    // 取消某一个回调函数
    unRegisterCallBack(socketType) {
        this.callBackMapping[socketType] = null
    }

    // 定义一个发送数据到服务端的方法
    send(data) {
        // 判断此时是否连接成功
        if (this.connected) {
            this.sendRetryCount = 0
            this.ws.send(JSON.stringify(data))
        } else {
            this.sendRetryCount++
            setTimeout(() => {
                this.send(data)
            }, 500 * this.sendRetryCount)
        }
    }
}