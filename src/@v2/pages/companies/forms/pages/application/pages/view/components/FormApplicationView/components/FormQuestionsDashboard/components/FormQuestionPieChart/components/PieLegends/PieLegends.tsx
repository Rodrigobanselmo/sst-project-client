import { useTheme } from '@mui/material';

export const PieLegends = ({
  data,
  total,
  vertical = false,
}: {
  data: {
    label: string;
    color: string;
    value: number;
  }[];
  total: number;
  vertical?: boolean;
}) => {
  const { palette } = useTheme();
  const newData = [...data];

  if (total) newData.push({ label: 'Total', color: '', value: total });

  return (
    <div>
      <ul
        style={{
          display: 'flex',
          flexWrap: vertical ? 'nowrap' : 'wrap',
          flexDirection: vertical ? 'column' : 'row',
          justifyContent: 'center',
          listStyle: 'none',
          padding: 0,
          marginTop: vertical ? 0 : 16,
          marginBottom: 0,
          gap: vertical ? 6 : 0,
        }}
      >
        {newData.map((item) => (
          <li
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: vertical ? 0 : 8,
              marginRight: vertical ? 0 : 16,
              overflowWrap: 'anywhere',
              minWidth: 0,
              fontSize: 12,
              color: palette.text.primary,
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
                  flexShrink: 0,
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
