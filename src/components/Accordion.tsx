import React, { useId, useState, type ChangeEventHandler } from "react";
import "./Accordion.css";

export const Accordion = ({
	title,
	body,
}: {
	title: string;
	body: string;
}) => {
	const bodyId = useId();
	const [expanded, setExpanded] = useState(false);
	return (
		<div>
			<button
				onClick={() => setExpanded(!expanded)}
				aria-controls={bodyId}
				aria-expanded={expanded}
			>
				{title}
			</button>
			<div
			id={bodyId}
				className={expanded ? '' : 'hidden'}
			>
				{body}
			</div>
		</div>
	)
}

const RadioAccordionInput = ({
	radioGroupName,
	id,
	label,
	value,
	selectedValue,
	onChange
}: {
	radioGroupName: string;
	id: string;
	label: string;
	value: string;
	selectedValue: string | null;
	onChange: ChangeEventHandler<HTMLInputElement>;
}) => {
	return (
		<>
			<input
				id={id}
				type="radio"
				name={radioGroupName}
				value={value}
				onChange={onChange} 
				aria-expanded={selectedValue === value}
				checked={selectedValue === value}
				aria-controls={`${id}-body`}
			/>
			<label htmlFor={id}>{label}</label>
		</>
	)
}

export const RadioAccordion = () => {
	const [foo, setFoo] = useState<string | null>(null);
	const radioGroupName = 'demo';

	return (
		<div>
			<div>
				<RadioAccordionInput id="a" radioGroupName={radioGroupName} value="A" label="First president?" selectedValue={foo} onChange={(e) => setFoo(e.target.value)} />
				<RadioAccordionInput id="b" radioGroupName={radioGroupName} value="B" label="Second president?" selectedValue={foo} onChange={(e) => setFoo(e.target.value)} />
			</div>
			<div id='a-content' className={foo === 'A' ? '' : 'hidden'}>
				George Washington
			</div>
			<div id='b-content' className={foo === 'B' ? '' : 'hidden'}>
				John Adams
			</div>
		</div>
	)
}
