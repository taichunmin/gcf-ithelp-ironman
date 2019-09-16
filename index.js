require('dotenv').config()

const _ = require('lodash')
const axios = require('axios')
const moment = require('moment')
const Qs = require('qs')
const csvParse = require('csv-parse')
const Joi = require('@hapi/joi')

/**
 * 取得 process.env.[key] 的輔助函式，且可以有預設值
 */
exports.getenv = (key, defaultval) => {
  return _.get(process, ['env', key], defaultval)
}

// https://ithelp.ithome.com.tw/articles/10191096
const ITHELP_COOKIE = exports.getenv('ITHELP_COOKIE')
const IRONMAN_ID = exports.getenv('IRONMAN_ID')
const IRONMAN_TOKEN = exports.getenv('IRONMAN_TOKEN')
const ARTICLE_CSV = exports.getenv('ARTICLE_CSV')

const articleSchema = Joi.object({
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  subject: Joi.string().empty().required(),
  tags: Joi.array().items(Joi.string().trim().empty()).unique().min(1),
  description: Joi.string().empty().min(300).required(),
})

exports.articleValidate = article => articleSchema.validateAsync(article, { stripUnknown: true })

exports.main = async (data, context) => {
  try {
    let article = _.head(_.filter(await exports.getCsv(ARTICLE_CSV), { date: exports.todayStr() }))
    article.tags = JSON.parse(article.tags)
    article = await exports.articleValidate(article)
    const articleId = await exports.createArticle()
    await exports.publishArticle(articleId, article)
    console.log(`articleId = ${articleId}, article = ${JSON.stringify(_.pick(article, ['date', 'subject']))}`)
  } catch (err) {
    console.log(err)
    throw err
  }
}

exports.createArticle = async () => {
  const res = await axios.get(`https://ithelp.ithome.com.tw/2020ironman/create/${IRONMAN_ID}`, {
    maxRedirects: 0,
    validateStatus: status => status === 302,
    headers: {
      Cookie: ITHELP_COOKIE
    }
  })
  return res.data.match(/articles\/(.+)\/draft/)[1]
}

exports.publishArticle = async (articleId, article) => {
  return await axios.post(`https://ithelp.ithome.com.tw/articles/${articleId}/publish`, exports.httpBuildQuery({
    _token: IRONMAN_TOKEN,
    _method: 'PUT',
    subject: article.subject,
    description: article.description,
    tags: ['11th鐵人賽', ...article.tags]
  }), {
    headers: {
      Cookie: ITHELP_COOKIE
    }
  })
}

exports.httpBuildQuery = obj => Qs.stringify(obj, { arrayFormat: 'brackets' })

exports.getCsv = async url => {
  const res = await axios.get(url)
  return await new Promise((resolve, reject) => {
    csvParse(res.data, { columns: true }, (err, output) => err ? reject(err) : resolve(output))
  })
}

exports.todayStr = () => moment().utcOffset(8).format('Y-MM-DD')
