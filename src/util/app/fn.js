export function getH5Origin () {
  let origin = 'https://daily-myouxuan.hzxituan.com/'
  const host = window.location.host;
  if (host.indexOf('daily-xt-crmadmin') >= 0) {
    origin = 'https://daily-myouxuan.hzxituan.com/';
  } else if (host.indexOf('pre-xt-crmadmin') >= 0) {
    origin = 'https://pre-xt-myouxuan.hzxituan.com/pre/index.html';
  } else if (host.indexOf('test-crmadmin') >= 0) {
    origin = 'https://testing.hzxituan.com/';
  } else if (host.indexOf('xt-crmadmin') >= 0) {
    /** 正式 */
    origin = 'https://myouxuan.hzxituan.com/';
  }
  return origin
}

export const handleLoading = (function () {
  let ajaxCount = 0
  return (loading = 'end') => {
    if (loading === 'start') {
      ajaxCount++
    } else {
      ajaxCount--
    }
    const el = document.querySelector('#loading')
    const display = getComputedStyle(el).display
    if (ajaxCount > 0 && display === 'none') {
      el.setAttribute('style','display:block')
    } 
    if (ajaxCount <= 0 && display !== 'none') {
      el.setAttribute('style','display:none')
      ajaxCount = 0
    }
  }
})()