import { getEnv } from '@/util/baseHost'
type ServerNameType = 'palamidi' | 'ulive' | 'message' | 'default'
type EnvType = 'dev' | 'test' | 'test2' | 'pre' | 'prod'

/** 后端环境接口映射 */
export const serverMapper: {
  [name in ServerNameType]: {
    [env in EnvType]?: string
  }
} = {
  // guard: {
  //   dev: 'https://daily-guard.hzxituan.com',
  //   test: 'https://test-guard.hzxituan.com',
  //   test2: 'https://test-guard.hzxituan.com',
  //   pre: 'https://staging-guard.hzxituan.com',
  //   prod: 'https://guard.hzxituan.com'
  // },
  palamidi: {
    dev: 'https://daily-palamidi-console.hzxituan.com',
    test: 'https://test-palamidi-console.hzxituan.com',
    test2: 'https://test-palamidi-console.hzxituan.com',
    pre: 'https://staging-palamidi-console.hzxituan.com',
    prod: 'https://palamidi-console.hzxituan.com'
  },
  ulive: {
    dev: 'https://dailylive-center.hzxituan.com',
    test: 'https://test01live-center.hzxituan.com',
    test2: 'https://test01live-center.hzxituan.com',
    pre: 'https://pre-live-center.hzxituan.com',
    prod: 'https://live-center.hzxituan.com'
  },
  message: {
    dev: 'https://test01center-bi.hzxituan.com',
    test: 'https://test01center-bi.hzxituan.com',
    test2: 'https://test01center-bi.hzxituan.com',
    pre: 'https://pre-center-bi.hzxituan.com',
    prod: 'https://center-bi.hzxituan.com'
  },
  default: {
    dev: 'https://daily-crm-test.hzxituan.com',
    test: 'https://testapi-crmadmin.hzxituan.com',
    test2: 'https://test2api-crmadmin.hzxituan.com',
    pre: 'https://pre-xt-crm-api.hzxituan.com',
    prod: 'https://youxuan-crm-api.hzxituan.com'
  }
}

export function handleApiUrl (url: string) {
  const env = getEnv()
  const serverPattern = /^::(message|ulive|palamidi|guard)/
  if ((/^https?/).test(url)) {
    return url
  } else if (serverPattern.test(url)) {
    const result = url.match(serverPattern)
    const servername = (result && result[1] || 'default') as ServerNameType
    const currentServerEnum: any = serverMapper[servername] || serverMapper.default
    const apiOrigin = currentServerEnum[env] || currentServerEnum.dev || ''
    console.log(env, currentServerEnum, 'handleApiUrl handleApiUrl handleApiUrl')
    return url.replace(serverPattern, apiOrigin)
  } else {
    return url
  }
}