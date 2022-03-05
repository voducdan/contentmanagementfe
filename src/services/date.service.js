const daydiff = (date1, date2)=>{
    const diffTime = Math.abs(date1 - date2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays
}

module.exports = {
    daydiff
}