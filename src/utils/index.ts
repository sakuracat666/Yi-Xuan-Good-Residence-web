import { ResultEnum } from '@/enums/httpEnums'

/**
 * @description: 根据不同时间返回不同问候语
 * @returns {String}
 */
export const timeFix = (): string => {
  const time = new Date()
  const hour = time.getHours()
  if (hour < 9) return '早上好'
  if (hour < 11) return '上午好'
  if (hour < 13) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

/**
 * @description: 随机欢迎词
 * @returns {String}
 */
export const welcome = (): string => {
  const arr = [
    '欢迎使用公寓管理系统',
    '祝您工作愉快'
  ]
  const index = Math.floor(Math.random() * arr.length)
  return arr[index]
}

export const num = 0

/**
 * 递归树结构，修改树结构的属性的key
 * @param data 树结构数据
 * @param key 要修改的key
 * @param value 要修改的key的值
 * @param childrenName 子节点的key名称
 * @param joinPropName 要拼接的key的名称
 */
export function recursionTree(
  data: any[],
  key: string,
  value: string,
  childrenName = 'children',
  joinPropName?: string,
) {
  data.forEach((item) => {
    if (item[value]) {
      item[key] = item[value]
      delete item[value]
    }
    if (joinPropName) {
      item[key] = item[key] + '|' + item[joinPropName]
    }
    if (item[childrenName]) {
      recursionTree(item[childrenName], key, value, childrenName, joinPropName)
    }
  })
}

/**
 * 将形如'HH:mm:ss'的时间字符串转换为秒数
 * @param timeString : 'HH:mm:ss' 格式的时间字符串
 */
export function timeStringToSeconds(timeString: string): number {
  const [hours, minutes, seconds] = timeString.split(':').map(Number)
  return (hours * 60 + minutes) * 60 + seconds
}
/**
 * 将秒数转换为形如 'HH:mm:ss' 的时间字符串
 * @param seconds 秒数
 * @returns 格式为 'HH:mm:ss' 的时间字符串
 */
export function secondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const sec = (seconds % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${sec}`
}
