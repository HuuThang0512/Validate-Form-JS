const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
// Validator constructor

function Validator(options) {

    var selectorRules = {}
    var formElement = $(options.form)
    var rules = options.rules

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
        var errorElement = inputElement.closest('.form-group').querySelector(options.errorSelector)
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
            inputElement.closest('.form-group').classList.add('invalid')
        } else {
            errorElement.innerHTML = '';
            inputElement.closest('.form-group').classList.remove('invalid')
        }
        return !errorMessage;
    }

    // Take form's element need validating
        if(formElement) {
            rules.forEach( function (rule) {
                var inputElements = formElement.querySelectorAll(rule.selector)
                // Handle events on inputs
                Array.from(inputElements).forEach(function (inputElement) {
                    // console.log(inputElement)
                    var errorElement =  inputElement.closest('.form-group').querySelector(options.errorSelector)
                    if(inputElement) {
                        var isInvalid = inputElement.closest('.form-group').classList.contains("invalid")
                        // console.log(isInvalid)
                        inputElement.oninput = function () {
                            // if(isInvalid) {
                                inputElement.closest('.form-group').classList.remove('invalid')
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
                return message || 'Vui l??ng nh???p tr?????ng n??y'
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
                return regex.test(value) ? undefined : message || 'Email kh??ng h???p l???'
            } else {
                return 'Vui l??ng nh???p Email'
            }
            
        }
    }
}

Validator.minLength = function (selector, length) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= length ? undefined : `Tr?????ng n??y ph???i bao g???m ??t nh???t ${length} k?? t???`
        }
    }
}

Validator.isConfirmed = function (selector, message, getPasswordValue) {
    return {
        selector: selector,
        test: function (value) {
            return value === getPasswordValue() ? undefined : message || 'Gi?? tr??? nh???p v??o kh??ng ch??nh x??c'
        }
    }
}