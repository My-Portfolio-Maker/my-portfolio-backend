const { userValidation } = require("./Errors")



const ErrorHandler = (error)=>{
    if(error) {
        const {errors, _message} = error
        switch(_message){
            
            case 'Users validation failed': 
                return userValidation(errors)

            default : return errors
        }
    }
        
}


module.exports = ErrorHandler