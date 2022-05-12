const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
// Validator constructor

function Validator(options) {

    var selectorRules = {}

    function getParentElement(element, formGroup) {
        while(element.parentElement) {
            if(element.parentElement.matches(formGroup)) {
                return element.parentElement
            } else {
                element = element.parentElement
            }
        }
    }

    //Validate Form
    function validate (inputElement, rule) {
        var errorElement = getParentElement(inputElement, '.form-group').querySelector(options.errorSelector)
        var errorMessage
        var inputRules = selectorRules[rule.selector]
        // console.log(selectorRules[rule.selector])
        for(var i = 0; i < inputRules.length; i++) {

            switch(inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = inputRules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default: 
                    errorMessage = inputRules[i](inputElement.value)
                    break;
            }
            if(errorMessage) break;
        }
        if(errorMessage) {
            errorElement.innerHTML = errorMessage;
            getParentElement(inputElement, '.form-group').classList.add('invalid')
        } else {
            errorElement.innerHTML = '';
            getParentElement(inputElement, '.form-group').classList.remove('invalid')
        }
        return !errorMessage;
    }

    // Take form's element need validating
    var formElement = $(options.form)
    var rules = options.rules
        if(formElement) {
            rules.forEach( function (rule) {
                var inputElements = formElement.querySelectorAll(rule.selector)
                console.log(1)
                // Handle events on inputs
                Array.from(inputElements).forEach(function (inputElement) {
                    var errorElement =  getParentElement(inputElement, '.form-group').querySelector(options.errorSelector)
                    if(inputElement) {
                        var isInvalid = getParentElement(inputElement, '.form-group').classList.contains("invalid")
                        // console.log(isInvalid)
                        inputElement.oninput = function () {
                            // if(isInvalid) {
                                getParentElement(inputElement, '.form-group').classList.remove('invalid')
                                errorElement.innerHTML = ''
                            // }
                        }
                        inputElement.onblur = function () {
                            validate(inputElement, rule)
                        }
                    }
                })

                // Save input's rules
                if(Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test)
                } else {
                    selectorRules[rule.selector] = [rule.test]
                }

                // Handle Event Submit
                formElement.onsubmit = function (e) {
                    e.preventDefault()
                    var isSuccess = true

                    rules.forEach( function (rule) {
                        var inputElement = formElement.querySelector(rule.selector)
                        isSuccess = validate(inputElement, rule)
                    })

                    if(isSuccess) {
                        if(typeof options.onSubmit === 'function') {
                            var enableInput =  Array.prototype.slice.call(formElement.querySelectorAll('input[name]:not(disable)'))
                            var formValue = Array.from(enableInput).reduce(function(value, input) {
                                switch(input.type) {
                                    case 'radio':
                                        if(!value[input.name]) {
                                            if(input.matches(':checked')) {
                                                value[input.name] = input.value
                                            } else {
                                                value[input.name] = '' 
                                            }
                                        }
                                        break;
                                    case 'checkbox':
                                        if(!input.matches(':checked')) return value
                                        if(!Array.isArray(value[input.name])) {
                                            value[input.name] = []
                                        }
                                        value[input.name].push(input.value)
                                        break;
                                    default:
                                        value[input.name] = input.value
                                        break;
                                }
                                return value;
                            }, {})
                            options.onSubmit(formValue)
                        } else {
                            formElement.submit()
                        }
                        alert(`Successful account registration
                            Gender: ${formValue.gender}
                            Full Name: ${formValue.fullname}
                            Email: ${formValue.email}
                        `)
                    }

                }

            })
        }

}

// Define rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            // While user fill in space
            if(value.trim()) {
                return undefined
            } else {
                return message || 'Vui lòng nhập trường này'
            }
        }
    }
}

Validator.isEmail = function(selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /\S+@\S+\.\S+/;
            if(value) {
                return regex.test(value) ? undefined : message || 'Email không hợp lệ'
            } else {
                return 'Vui lòng nhập Email'
            }
            
        }
    }
}

Validator.minLength = function (selector, length) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= length ? undefined : `Trường này phải bao gồm ít nhất ${length} kí tự`
        }
    }
}

Validator.isConfirmed = function (selector, message, getPasswordValue) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPasswordValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}