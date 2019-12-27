function PaypleSDK(options) {

    if (isNaN(options.PCD_PAY_TOTAL)) return alert('결제금액 형식이 바르지 않습니다.')
    if ('card' === options.PCD_PAY_TYPE && options.PCD_PAY_TOTAL < 100) return alert('결제금액은 100원 이상 이어야 합니다.')
    if ('card' !== options.PCD_PAY_TYPE && options.PCD_PAY_TOTAL < 1000 ) return alert('결제금액은 1,000원 이상 이어야 합니다.')

    var self = this

    this.auth = function(cst_id, custKey, callback) {

        var form = new FormData(),
            xhr = new XMLHttpRequest()

        form.append('cst_id', cst_id)
        form.append('custKey', custKey)

        xhr.onload = function() {

            if (xhr.status !== 200) return

            var data = JSON.parse(xhr.responseText)

            if (data.result !== 'success') return alert(data.result_msg)

            callback(data)

        }

        xhr.open('POST', options.PCD_AUTH_URL)
        xhr.send(form)

    }

    this.popup = function(returnURL) {

        var formElement = document.createElement('form'),
            popupFeatures = 'width:450px,height:100%,toolbars=no,menubars=no,status=no,resizable=no,location=no',
            popupCallback = function(e) {

                var type = e.data.type,
                    data = e.data.data
    
                options.callbackFunction(type === 'pay_result' ? data : options)
    
            }

        formElement.id = 'CpayForm'
        formElement.method = 'POST'
        formElement.action = returnURL
        
        if (window.navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad|android)/)) {

            formElement.target = 'cpayWinOpen'

            if (null == window.open('', formElement.target, popupFeatures)) return alert(' 팝업이 차단되어 결제를 진행할 수 없습니다. \r\n 폰 설정에서 팝업차단을 풀어주세요. ')

        } else {

            formElement.target = 'cpay_ifr'

            self.layer()

        }

        // IE9
        Object.keys(options).forEach(function (e) {

            var input = document.createElement('input')

            input.type = 'hidden'
            input.name = e
            input.value = options[e]

            formElement.appendChild(input)

        })

        document.body.appendChild(formElement)
        formElement.submit()

        window.removeEventListener('message', popupCallback)
        window.addEventListener('message', popupCallback)

    }

    this.layer = function() {

        var layerElement = document.createElement('div'),
            iframeElement = document.createElement('iframe'),
            layerName = 'layer_cpay',
            iframeName = 'cpay_ifr'

        layerElement.id = layerName
        layerElement.name = layerName

        layerElement.style.width = '100%'
        layerElement.style.height = '100%'
        layerElement.style.position = 'absolute'
        layerElement.style.zIndex = '16777270'
        layerElement.style.top = '0'
        layerElement.style.left = '0'
        layerElement.style.marginTop = '0px'
        layerElement.style.marginLeft = '0px'
        layerElement.style.background = 'url(https://testcpay.payple.kr/img/background.png)'
        layerElement.style.backgroundRepeat = 'no-repeat'
        layerElement.style.backgroundSize = '100% 100%'
        layerElement.style.filter = 'alpha(opacity=50)'

        iframeElement.id = iframeName
        iframeElement.name = iframeName

        iframeElement.style.width = '450px'
        iframeElement.style.height = '100%'
        iframeElement.style.left = '20%'
        iframeElement.style.position = 'absolute'
        iframeElement.style.zIndex = '16777271'
        iframeElement.style.background = 'white'
        iframeElement.frameBorder = '0'
        iframeElement.scrolling = 'auto'

        layerElement.appendChild(iframeElement)
        document.body.appendChild(layerElement)

    }

    return {
        run: function() {

            self.auth(options.PCD_CST_ID, options.PCD_CUST_KEY, function(data) {

                options.PCD_CST_ID = data.cst_id
                options.PCD_CUST_KEY = data.custKey
                options.PCD_AUTH_KEY = data.AuthKey

                options.PCD_RST_URL = ''
                options.PCD_HTTP_REFERER = location.href

                self.popup(data.return_url)

            })

        }

    }

}