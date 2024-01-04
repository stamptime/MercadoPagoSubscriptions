const { default: axios } = require('axios');
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(express.json());
app.use(cors());

ACCESS_TOKEN = "xxx"

const config = {
  headers: {
    Authorization: "Bearer " + ACCESS_TOKEN
  }
}

const coupons = {
  "SUPER100": {
    "discount": 100
  },
  "SUPER10": {
    "discount": 10
  },
  "SUPER50": {
    "discount": 50
  },
  "SUPER0": {
    "discount": 0
  }
}

const getCoupon = (id) => {
  return coupons[id]
}


app.get('/plans', async (req, res) => {
  const response  = await axios.get(`https://api.mercadopago.com/preapproval_plan/search?status=active`, config)
  const data = await response.data
  // remove plans subscribed field
  data.results.map(plan => delete plan.subscribed)

  res.json(data)
})


app.get('/plans/:id', async (req, res) => {
  const response  = await axios.get(`https://api.mercadopago.com/preapproval_plan/${req.params.id}`, config)
  const data = await response.data

  // remove plan subscribed field
  delete data.subscribed

  res.json(data)
})


app.post('/subscriptions', async (req, res) => {
  const {body} = req
  const response = await axios.get(`https://api.mercadopago.com/preapproval_plan/${req.body.plan_id}`, config).catch()
  const plan = await response.data

  if (body?.coupon_id){
    const coupon = getCoupon(body.coupon_id)

    if(!coupon) {
      res.status(400)
      res.json({
        "message": "invalid coupon"
      })
      return
    }


    // Apply coupon discount to the plan price
    plan.auto_recurring.transaction_amount -= plan.auto_recurring.transaction_amount * coupon.discount/100
  }

  const payload = {
    reason: plan.reason,
    payer_email: body.customer.email,
    auto_recurring: plan.auto_recurring,
    back_url: plan.back_url,
    status: "pending"
  }


  axios.post("https://api.mercadopago.com/preapproval", payload, config)
    .then(response => {
      res.json(response.data)
    })
    .catch(err => {
      res.status(err.response.status)
      res.json({
        message: err.response.statusText
      })
      return
    })

})


app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
