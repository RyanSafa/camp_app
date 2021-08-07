module.exports = func => {
    return (req,res,next) => {
        func(req,res,next).catch(next); // catches error and passes it to our error middleware
    }
}