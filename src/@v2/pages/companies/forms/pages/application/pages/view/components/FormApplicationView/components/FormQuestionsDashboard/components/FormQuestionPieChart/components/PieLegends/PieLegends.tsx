export const PieLegends = ({
  data,
  total,
}: {
  data: {
    label: string;
    color: string;
    value: number;
  }[];
  total: number;
}) => {
  const newData = [...data];

  if (total) newData.push({ label: 'Total', color: '', value: total });

  return (
    <div>
      <ul
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          listStyle: 'none',
          padding: 0,
          marginTop: 16,
        }}
      >
        {newData.map((item) => (
          <li
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 8,
              marginRight: 16,
              fontSize: 12,
              color: 'rgb(51, 51, 51)',
              fontWeight: !item.color ? 600 : 400,
            }}
          >
            {item.color && (
              <span
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  marginRight: 8,
                }}
              />
            )}
            {item.label} ({item.value})
          </li>
        ))}
      </ul>
    </div>
  );
};
