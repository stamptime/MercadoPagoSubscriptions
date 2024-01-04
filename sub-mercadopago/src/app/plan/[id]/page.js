'use client'
import {useState, useEffect} from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Paper from '@mui/material/Paper';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useForm } from "react-hook-form";
import { createSubscription, getPlan } from '@/services';
import { Grid, ListItem, ListItemText, TextField } from '@mui/material';
import Link from 'next/link';
import { useReward } from 'react-rewards';

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const steps = ['Payment details', 'Review your order'];



export default function Order({params}) {
  	const [activeStep, setActiveStep] = useState(0);
	const { reward, isAnimating } = useReward('coupon-reward', 'confetti')
	const { register, handleSubmit } = useForm();
	const [currentPlan, setCurrentPlan ] = useState(null);
	const [sub, setSub ] = useState(null);

	const handleNext = () => {
		setActiveStep(activeStep + 1);
	};

	const handleBack = () => {
		setActiveStep(activeStep - 1);
	};

	const onApplyCoupon = async (values) => {
		values = {...values, plan_id: currentPlan.id}
		if (values?.coupon_id)
		try {
			const currentSub = await createSubscription(values)
			setSub(currentSub)
			setCurrentPlan({...currentPlan, auto_recurring: currentSub.auto_recurring})
			reward()
		}
		catch(ex){
			console.log(ex)
			return
		}
	}

	const onSubmit = async (values) => {
		if (!sub){
		console.log("wtf is happening here")
			values = {...values, plan_id: currentPlan.id}
			try {
				const currentSub = await createSubscription(values)
				setSub(currentSub)
				window.location.href = currentSub.init_point
			}
			catch(ex){
				console.log(ex)
				return
			}
		}

		window.location.href = sub.init_point
	}

	const getStepContent = (activeStep) => {
		switch (activeStep) {
			case 0:
				return (<Grid item xs={12} sm={6}>
				  <TextField
					{...register("customer.email")}
					required
					label="Email"
					type='email'	
					fullWidth
					autoComplete="sub email-level2"
					variant="outlined"
				  />
				</Grid>
			)
			case 1:
				return (<Grid item xs={12} sm={6}>
					<Typography variant="h3" sx={{ fontWeight: 700 }}>
						{currentPlan?.reason}
					</Typography>

				  	<TextField
						{...register("coupon_id")}
						required
						id="coupon_id"
						name="coupon_id"
						label="Coupon"
						type='email'	
						fullWidth
						autoComplete="sub email-level2"
						variant="outlined"
					/>
					<Button
					  variant="contained"
					  onClick={handleSubmit(onApplyCoupon)}
					  sx={{ mt: 3, ml: 1 }}
					>
						Apply
						<span id="coupon-reward" />
					</Button>
					<ListItem sx={{ py: 1, px: 0 }}>
					<ListItemText primary="Total" />
						<Typography variant="h4" sx={{ fontWeight: 700 }}>
					      ${currentPlan.auto_recurring.transaction_amount}
					    </Typography>
					    <Typography variant="h6" color="text.secondary">
					      /{currentPlan.auto_recurring.frequency}{currentPlan.auto_recurring.frequency_type}
					    </Typography>
					</ListItem>
				</Grid>
			)
			default:
				throw new Error('Unknown step');
		}
	}
	
	useEffect(() => {
		const fetchPlan = async () => {
			const plan =  await getPlan(params.id)
			console.log(plan)
			setCurrentPlan(plan)
		}
		fetchPlan()
	}, [])

  return (
    <>
      <CssBaseline />
      <AppBar
        position="absolute"
        color="default"
        elevation={0}
        sx={{
          position: 'relative',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap>
            Company name
          </Typography>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
          <Typography component="h1" variant="h4" align="center">
            Subscription 
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <>
              <Typography variant="h5" gutterBottom>
                Thank you for your order.
              </Typography>
              <Typography variant="subtitle1">
                Your order number is #2001539. We have emailed your order
                confirmation, and will send you an update when your order has
                shipped.
              </Typography>
            </>
          ) : (
            <>
		{getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                    Back
                  </Button>
                )}
		{activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit(onSubmit)}
                  sx={{ mt: 3, ml: 1 }}
                >
        		Subscribe!
                </Button>):(
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{ mt: 3, ml: 1 }}
                >
                	Next
                </Button>)
		}
              </Box>
            </>
          )}
        </Paper>
        <Copyright />
      </Container>
    </>
  );
}
