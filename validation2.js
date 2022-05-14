

function Validate(formSelector) {
    var _this = this;
    var formRules = {};

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement
            } else {
                element = element.parentElement
            }
        }
    }

    var validatorRules = {
        required: function(value) {
            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email: function(value) {
            var regex = /\S+@\S+\.\S+/;
            if(value) {
                return regex.test(value) ? undefined : message || 'Email không hợp lệ'
            } else {
                return 'Vui lòng nhập Email'
            }
        },
        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`
            }
        },
        max: function(max) {
            return function(value) {
                return value.length <= max ? undefined : `Trường này có số kí tự giới hạn là ${max}`
            }
        },
    }

    // Take form element in Dom by 'formSelector'
    var formElement = document.querySelector(formSelector)
    // Handle while formElement
    if(formElement) {
        var inputs = formElement.querySelectorAll('[name][rules]')
        Array.from(inputs).forEach(function(input) {

            var rules = input.getAttribute('rules').split('|');
            for(var rule of rules) {
                var ruleInfor
                var isRuleHasValue = rule.includes(':')
                if(isRuleHasValue) {
                    ruleInfor = rule.split(':')
                    // console.log(ruleInfor)
                    rule = ruleInfor[0]
                }

                var ruleFunc = validatorRules[rule]

                if(isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfor[1])
                }
                if(Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc)
                } else {
                    formRules[input.name] = [ruleFunc]
                }
            }
            // console.log(rules)

            // Handle Events
            input.onblur = handleValidate
            input.oninput = handleClearError

                // Xử lí khi input bị lỗi
            function handleValidate(value) {
                var errorMessage
                for(rule of formRules[value.target.name]) {
                    errorMessage = rule(value.target.value)
                    if(errorMessage) break
                }

                if(errorMessage) {
                    var formGroup = getParent(value.target, '.form-group')
                    var errorText = formGroup.querySelector('.form-message__text')
                    errorText.innerHTML = errorMessage
                    formGroup.classList.add('invalid')
                }

                // console.log(errorMessage)
                return errorMessage
            }
            // Xử lí khi người dùng nhập thông tin
            function handleClearError() {
                var formGroup = getParent(input, '.form-group')
                var errorText = formGroup.querySelector('.form-message__text')
                if(formGroup.classList.contains('invalid')) {
                    formGroup.classList.remove('invalid')
                    errorText.innerHTML = ''
                }
            }
            // Xử lí form Submit
            formElement.onsubmit = function(e) {
                e.preventDefault()
                var user = {}
                var isValid = true
                for(var input of inputs) {
                    if (handleValidate({ target: input })) {
                        isValid = false;
                    }  
                    if(Array.isArray(user[input.name])) {
                        user[input.name].push(input.value)
                    } else {
                        user[input.name] = [input.value]
                    }
                }
                if(isValid) {
                    if(typeof _this.onSubmit === 'function') {
                        _this.onSubmit(user)
                    }
                }
            }
        })
        
    }
     

    
}