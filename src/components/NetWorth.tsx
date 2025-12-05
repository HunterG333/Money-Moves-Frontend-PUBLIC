interface NetWorthProps{
  dataset: number[];
  error?: string | null;
  percentageChange?: { change: number; isPositive: boolean } | null;
}

function NetWorth({ dataset, error, percentageChange }: NetWorthProps) {
  // Guard: if dataset is empty, show a styled message in a container
  if (!dataset.length) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center pt-4">
        <h1 className="text-center">Net Worth</h1>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            width: '80vw',
            maxWidth: '70%',
            minWidth: '300px',
            height: '70vh',
            border: '2px dashed #ccc',
            background: '#f8f9fa',
            color: '#b94a48',
            fontSize: '1.2rem',
            textAlign: 'center',
            borderRadius: '12px',
            marginTop: '1em',
          }}
        >
          {error ? error : "No net worth data available."}
        </div>
      </div>
    );
  }

  //Get most recent value from the dataset for the net worth
  let netWorthValue = dataset[dataset.length-1];  

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center pt-4">
        <h1 className="text-center">Net Worth</h1>
        <div className="d-flex align-items-center gap-3">
          <h3 className="text-center mb-0">${netWorthValue.toLocaleString()}</h3>
          {percentageChange && (
            <span
              className="badge fs-6"
              style={{
                backgroundColor: percentageChange.isPositive ? '#28a745' : '#dc3545',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '20px',
                fontWeight: 'bold'
              }}
            >
              {percentageChange.isPositive ? '+' : ''}{percentageChange.change}%
            </span>
          )}
        </div>
        {error && (
          <div style={{ color: "red", margin: "1em 0" }}>{error}</div>
        )}
      </div>
    </>
  );
}

export default NetWorth;
