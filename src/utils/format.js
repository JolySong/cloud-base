// 日期格式化
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

// 文件大小格式化
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 金额格式化
export const formatMoney = (amount, currency = '¥') => {
  return `${currency}${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

// 手机号格式化
export const formatPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
} 