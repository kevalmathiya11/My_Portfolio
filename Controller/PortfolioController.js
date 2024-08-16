const sendEmail = (req,res) => {
    try {
        return res.status(200).json({
            success:true,
            message:"Message send Successfully"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:'Send Email API Error',
            error
        })
    }
}

module.exports = {sendEmail}