
import React, { useState } from "react"
import "./ChristineApologyForm.css";

export const ChristineApologyForm = () => {
	const [memory, setMemory] = useState<Record<string, any>>({
		q1: null,
		q2: '',
		q3: null,
	});

	return (
		<form>
			<div>
				I'm sorry Christine - Kevin
			</div>
			<div>
				<h2>Part 1</h2>
				<fieldset>
					<label>Do u forgive this dumbass?</label>
					<button onClick={
						(e) => {setMemory(prev => ({...prev, q1: 'yes'})); e.preventDefault();}
					}>Yes</button>
					<button onClick={
						(e) => {setMemory(prev => ({...prev, q1: 'no'})); e.preventDefault();}
					}>No</button>
				</fieldset>
			</div>
			{(memory.q1 === 'yes') && (<div>you folded too easy don't let kevin get off that easy</div>)}
			{(memory.q1 === 'no') && (<div>that is fair... what do you want</div>)}
			{memory.q1 === 'no' && (
			<div>
				<h2>Part 2</h2>
				<fieldset className='part2'>
					<label>What is your wish?</label>
					<input
						placeholder='whatever you desire... within $50 budget... WHATEVER yOU WANT!'
						value={memory.q2}
						onChange={(e) => setMemory(prev => ({...prev, q2: e.target.value}))}
					/>
				</fieldset>
				<button disabled={memory.q3 === true} onClick={(e) => {
					e.preventDefault();
					if (!memory.q2) {
						alert('you havent made your wish yet!')
					} else {
						setMemory(prev => ({...prev, q3: true }))
					}
				}}>Submit</button>
				{memory.q3 && (
					<div>
						loading wish...
						<div className="loader"></div> 
						<button onClick={(e) => {
							e.preventDefault();
							setMemory(prev => ({...prev, q4: true}));
						}}>one last thing while that's loading...</button>
					</div>
				)}
				{memory.q4 && (
					<div>
						<p>
						Robert Downey Jr. will return be in Avengers: Doomsday
						</p>
						<p>
						- this form was sponsored by Disney
						</p>
						<div className='empty-space'/>

						<p>jk</p>
						<p>but Tetris will be making an appearance for either valentines or birthday</p>
					</div>
				)}
			</div>
			)}
		</form>
	)
}
