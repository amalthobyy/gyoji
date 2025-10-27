import { useMemo, useState } from 'react'

type Gender = 'male' | 'female'

type Activity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

function activityFactor(a: Activity) {
	switch (a) {
		case 'sedentary': return 1.2
		case 'light': return 1.375
		case 'moderate': return 1.55
		case 'active': return 1.725
		case 'very_active': return 1.9
	}
}

function bmiResult(weightKg: number, heightCm: number) {
	const h = heightCm / 100
	const bmi = weightKg / (h * h)
	let category = 'Underweight'
	if (bmi >= 18.5 && bmi < 25) category = 'Normal'
	else if (bmi >= 25 && bmi < 30) category = 'Overweight'
	else if (bmi >= 30) category = 'Obese'
	return { bmi, category }
}

function bmrMifflin(weightKg: number, heightCm: number, age: number, gender: Gender) {
	return gender === 'male'
		? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
		: 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

export default function CalculatorPage() {
	// Shared inputs
	const [gender, setGender] = useState<Gender>('male')
	const [weight, setWeight] = useState(70) // kg
	const [height, setHeight] = useState(175) // cm
	const [age, setAge] = useState(28)
	const [activity, setActivity] = useState<Activity>('moderate')

	// Protein
	const [goal, setGoal] = useState<'weight_loss'|'muscle_gain'|'maintenance'>('maintenance')
	const protein = useMemo(() => {
		// Simple heuristic: 1.2-2.2 g/kg by goal and activity
		let base = 1.6
		if (goal === 'weight_loss') base = 1.8
		if (goal === 'muscle_gain') base = 2.0
		const activityAdj = activity === 'very_active' || activity === 'active' ? 0.2 : activity === 'moderate' ? 0.1 : 0
		const grams = (base + activityAdj) * weight
		return Math.round(grams)
	}, [weight, goal, activity])

	// BMI
	const { bmi, category } = useMemo(() => bmiResult(weight, height), [weight, height])

	// TDEE
	const tdee = useMemo(() => {
		const bmr = bmrMifflin(weight, height, age, gender)
		return Math.round(bmr * activityFactor(activity))
	}, [weight, height, age, gender, activity])

	// Body Fat (US Navy method as approximation)
	const [waist, setWaist] = useState(80) // cm
	const [neck, setNeck] = useState(38) // cm
	const [hip, setHip] = useState(90) // cm (female)
	const bodyFat = useMemo(() => {
		const log10 = (n: number) => Math.log10(Math.max(n, 1))
		if (gender === 'male') {
			const res = 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
			return Math.max(0, Math.min(60, res))
		} else {
			const res = 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.221 * log10(height)) - 450
			return Math.max(0, Math.min(60, res))
		}
	}, [gender, height, waist, neck, hip])

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Fitness Calculators</h1>
				<p className="text-gray-600">Get personalized recommendations with real-time results.</p>
			</div>

			{/* Shared Inputs */}
			<div className="bg-white rounded-xl shadow-xl p-6">
				<h2 className="text-xl font-semibold">Your Details</h2>
				<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label className="text-sm text-gray-600">Gender</label>
						<div className="mt-1 flex gap-2">
							<button onClick={()=>setGender('male')} className={`px-3 py-2 rounded-lg border ${gender==='male'?'border-blue-600 bg-blue-50':'border-gray-300'}`}>Male</button>
							<button onClick={()=>setGender('female')} className={`px-3 py-2 rounded-lg border ${gender==='female'?'border-blue-600 bg-blue-50':'border-gray-300'}`}>Female</button>
						</div>
					</div>
					<div>
						<label className="text-sm text-gray-600">Weight (kg)</label>
						<input type="number" value={weight} onChange={(e)=>setWeight(parseFloat(e.target.value||'0'))} className="mt-1 w-full border rounded-lg px-3 py-2" />
					</div>
					<div>
						<label className="text-sm text-gray-600">Height (cm)</label>
						<input type="number" value={height} onChange={(e)=>setHeight(parseFloat(e.target.value||'0'))} className="mt-1 w-full border rounded-lg px-3 py-2" />
					</div>
					<div>
						<label className="text-sm text-gray-600">Age</label>
						<input type="number" value={age} onChange={(e)=>setAge(parseInt(e.target.value||'0'))} className="mt-1 w-full border rounded-lg px-3 py-2" />
					</div>
					<div>
						<label className="text-sm text-gray-600">Activity Level</label>
						<select value={activity} onChange={(e)=>setActivity(e.target.value as Activity)} className="mt-1 w-full border rounded-lg px-3 py-2">
							<option value="sedentary">Sedentary</option>
							<option value="light">Light (1-3x/week)</option>
							<option value="moderate">Moderate (3-5x/week)</option>
							<option value="active">Active (6-7x/week)</option>
							<option value="very_active">Very Active (twice/day)</option>
						</select>
					</div>
				</div>
			</div>

			{/* Protein */}
			<div className="bg-white rounded-xl shadow-xl p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Protein Intake</h2>
					<select value={goal} onChange={(e)=>setGoal(e.target.value as any)} className="border rounded-lg px-3 py-2 text-sm">
						<option value="maintenance">Maintenance</option>
						<option value="weight_loss">Weight Loss</option>
						<option value="muscle_gain">Muscle Gain</option>
					</select>
				</div>
				<div className="mt-4">
					<div className="text-3xl font-bold text-blue-600">{protein} g/day</div>
					<p className="text-sm text-gray-600">Aim for {Math.round(protein/3)} g per meal across 3 meals.</p>
					<div className="h-2 bg-gray-200 rounded-full mt-3">
						<div className="h-2 bg-blue-600 rounded-full" style={{ width: Math.min(100, Math.round((protein/ (2.2*weight))*100)) + '%' }} />
					</div>
				</div>
			</div>

			{/* BMI */}
			<div className="bg-white rounded-xl shadow-xl p-6">
				<h2 className="text-xl font-semibold">BMI</h2>
				<div className="mt-4 flex items-end gap-6">
					<div>
						<div className="text-3xl font-bold">{bmi.toFixed(1)}</div>
						<div className="text-sm text-gray-600">{category}</div>
					</div>
					<div className="flex-1">
						<div className="h-2 bg-gray-200 rounded-full">
							<div className={`h-2 rounded-full ${category==='Normal'?'bg-green-500':category==='Overweight'?'bg-yellow-500':'bg-red-500'}`} style={{ width: Math.min(100, Math.max(0, ((bmi-15)/20)*100)) + '%' }} />
						</div>
						<p className="text-xs text-gray-500 mt-1">Healthy range: 18.5 - 24.9</p>
					</div>
				</div>
			</div>

			{/* TDEE */}
			<div className="bg-white rounded-xl shadow-xl p-6">
				<h2 className="text-xl font-semibold">TDEE (Maintenance Calories)</h2>
				<div className="mt-3 text-3xl font-bold text-blue-600">{tdee} kcal/day</div>
				<p className="text-sm text-gray-600">For {activity.replace('_',' ')} activity. Adjust +/- 300-500 kcal for weight change.</p>
			</div>

			{/* Body Fat */}
			<div className="bg-white rounded-xl shadow-xl p-6">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Body Fat % (US Navy)</h2>
					<div className="flex gap-2">
						<label className="text-sm text-gray-600">Waist (cm)
							<input type="number" value={waist} onChange={e=>setWaist(parseFloat(e.target.value||'0'))} className="mt-1 ml-2 w-24 border rounded-lg px-2 py-1" />
						</label>
						<label className="text-sm text-gray-600">Neck (cm)
							<input type="number" value={neck} onChange={e=>setNeck(parseFloat(e.target.value||'0'))} className="mt-1 ml-2 w-24 border rounded-lg px-2 py-1" />
						</label>
						{gender==='female' && (
							<label className="text-sm text-gray-600">Hip (cm)
								<input type="number" value={hip} onChange={e=>setHip(parseFloat(e.target.value||'0'))} className="mt-1 ml-2 w-24 border rounded-lg px-2 py-1" />
							</label>
						)}
					</div>
				</div>
				<div className="mt-4 flex items-end gap-6">
					<div>
						<div className="text-3xl font-bold">{bodyFat.toFixed(1)}%</div>
						<div className="text-sm text-gray-600">Estimated</div>
					</div>
					<div className="flex-1">
						<div className="h-2 bg-gray-200 rounded-full">
							<div className="h-2 bg-blue-600 rounded-full" style={{ width: Math.min(100, Math.max(0, bodyFat)) + '%' }} />
						</div>
						<p className="text-xs text-gray-500 mt-1">General healthy range: Men 10-20%, Women 18-28%</p>
					</div>
				</div>
			</div>
		</div>
	)
}
