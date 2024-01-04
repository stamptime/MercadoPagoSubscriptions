import axios from "axios"

const API_URL = "http://localhost:3000"

export const getPlans = async () => {
	const response = await axios.get(API_URL + "/plans")
	const data = await response.data
	return data
}

export const getPlan = async (id) => {
	const response = await axios.get(API_URL +`/plans/${id}`)
	const data = await response.data
	return data
}


export const createSubscription = async (payload) => {
	console.log(payload)
	const response = await axios.post(API_URL +`/subscriptions`, payload)
	const data = await response.data
	return data
}

