export const PieLegends = ({
  data,
}: {
  data: {
    label: string;
    color: string;
  }[];
}) => {
  return (
    <ul
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center', // Better for centering legend items
        listStyle: 'none',
        padding: 0,
        marginTop: 16, // Add some space above the legend
      }}
    >
      {data.map(
        (
          item, // Iterate over dataWithColorsForLegend
        ) => (
          <li
            key={item.label}
            style={{
              // width: 100, // Consider removing fixed width for better wrapping
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8, // Increased spacing
              marginRight: 16, // Spacing between items
              fontSize: 12,
              color: 'rgb(51, 51, 51)',
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                backgroundColor: item.color, // Use the color from dataWithColorsForLegend
                borderRadius: '50%',
                marginRight: 8, // Increased spacing
              }}
            />
            {item.label}
          </li>
        ),
      )}
    </ul>
  );
};
