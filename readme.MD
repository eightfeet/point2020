``` javascript

new Points({
    // Object 初始化参数
    data: {
        phone,
        antiFakeCode
    },

    // Object 自定义HTHLelement Id 与字段(表单/事件)的映射关系
    elementNodeMappingField,

    // Boolean 是否验证手机号码 默认否
    verifyPhone,

    // Boolean 是否绑定手机号码 默认否
    bindPhone,

    // Boolean 是否禁用手机号码 默认否
    disabledPhone,

    // Boolean 是否隐藏手机号码 默认否
    hidePhone,

    // Object 错误码与错误信息映射关系
    errorCodeMap,

    // object {antifakecode, bindPhone, sendValidateCode } 定义防伪积分，绑定手机，获取验证码等 api接口 默认使用中台生产API
    API,

    // String 挂载Dom 使用默认模版时，默认模版挂载的目标HTHLelement Id 
    targetId,

    // String 模板id 使用默认模版时，创建的子节点Id
    id,

    // Boolean 自动挂载 实例化Points时是否自动完成HTHLelement元素的挂载以及事件的处理，默认true；false时需要通过Points.mount方法手动挂载
    autoMount,

    // Function 扫码回调
    onScan,
    
    // Function 处理积分异常 Promise
    handleError,
    
    // Function 追加验证处理 Promise
    handleValidate,

    // Function 初始化回调
    onInit,

    // Function 积分回调
    onSubmit,
    
    // Object 验证手机倒计时设置 {interval: 倒计时, buttonText: 按钮文字, countdownText: 接受一个方法复写倒计时文字 count => `${count}秒后重试`}
    verifyPhoneCountdown
})

```

## Options

### Points.setData
Function 设置当前参数

### Points.mount
Function 挂载Points，重置数据代理与监听

### Points.$data
Object 获取当前参数

### Points.prevData
Object 获取历史请求数据与响应数据 {request, response}


## static
### Points.PointsError 
Class PointsError 用于创建Points内部能处理的异常， throw new PointsError(message, code) message错误信息 code错误码。

### Points.tools
其他工具集
```javascript
{
    Modal, // Class 信息弹窗
    Loading, // Class 加载 Loading
    validate, // Object 表单验证工具
    nativeAppJssdk, // 营养管家AppJssdk
    // 整合微信与营养管家App的条形码与二维码扫码方法
    scan:{
        qrCode,
        barCode
    }
}
```

