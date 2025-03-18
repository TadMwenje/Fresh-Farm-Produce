
import React, { useState, useEffect } from 'react';
import '../styles.css';
import axios from 'axios';

function FarmSalesPage() {
    const [submissions, setSubmissions] = useState([]); 

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get('http://localhost:5000/api/form-submissions');
                setSubmissions(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    },);

    return (
        <div className="submission-container">
          <h2>Submitted Data</h2>
          {submissions && submissions.length > 0 ? (
            submissions.map((submission) => (
              <div key={submission._id} className="submission-item">
                <p><strong>Name:</strong> {submission.name}</p>
                <p><strong>Email:</strong> {submission.email}</p>
                <p><strong>Message:</strong> {submission.message}</p>
                <p><strong>Sentiment:</strong> {submission.sentiment}</p>
                {submission.summary && (
                  <p><strong>Summary:</strong> {submission.summary}</p>
                )}
              </div>
            ))
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      );
    
}

export default FarmSalesPage;
