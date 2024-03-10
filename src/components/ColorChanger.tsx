import { useState } from "react";

const getRandomColor = () => {
	const hex = Math.floor(Math.random() * 0xFFFFFF);
	const hexstring = hex
		.toString(16)
		.padStart(6, '0');
	return `#${hexstring}`;
}

export const ColorChanger = ({ initialColor }: { initialColor: string }) => {
	const [color, setColor] = useState(initialColor);
	return (
		<form>
			<input type="color" defaultValue={color}/>
			<input type="button" value="Click to randomize color"
				onClick={() => setColor(getRandomColor())}
			/>
		</form>
	)
}

