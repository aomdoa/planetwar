export function successMessage(res, message) {
    return res.json({success: true, data: message})
}

export function failMessage(res, message) {
    return res.json({success: false, data: message})
}