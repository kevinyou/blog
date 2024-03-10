import { useEffect, useState } from "react";

const getRandomColor = () => {
	const hex = Math.floor(Math.random() * 0xFFFFFF);
	const hexstring = hex
		.toString(16)
		.padStart(6, '0');
	return `#${hexstring}`;
}

export const ColorChanger = ({ initialColor }: { initialColor: string }) => {
	const [color, setColor] = useState(initialColor);

	// As an easter egg, override link colors to chosen color
	useEffect(() => {
		[...document.getElementsByTagName('a')]
			.forEach(tag => {
				tag.setAttribute('style', `color: ${color}`)
			});
	}, [color])

	return (
		<form>
			<input type="color" value={color} onChange={e => setColor(e.target.value)}/>
			<input type="button" value="Click to randomize color"
				onClick={() => setColor(getRandomColor())}
			/>
		</form>
	)
}

