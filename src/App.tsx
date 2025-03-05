import { useEffect, useState } from 'react'
import toggleViewIcon from './assets/toggle-view-btn-icon.png'
import randomProblemIcon from './assets/random-problem-btn-icon.png'
import submitIcon from './assets/submit-btn-icon.png'
import './App.css'

const RANDOM_PROBLEM_URL = import.meta.env.VITE_RANDOM_PROBLEM_URL

interface Problem {
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  examples: Example[];
}

interface Example {
  input: string;
  output: string;
  explanation: string;
}

function App() {
  const [problem, setProblem] = useState<Problem>({
    title: '',
    difficulty: '',
    description: '',
    constraints: '',
    examples: []
  });

  async function fetchProblem() {
    try {
      console.log(RANDOM_PROBLEM_URL)
      const response = await fetch(RANDOM_PROBLEM_URL);
      if (!response.ok) throw new Error('❌ App.tsx -> API Error');
      const problem_data = await response.json();
      setProblem({
        title: problem_data.title,
        difficulty: problem_data.difficulty,
        description: problem_data.description,
        constraints: problem_data.constraints,
        examples: problem_data.examples
      });
    } catch (error) {
      console.error('❌ App.tsx -> Fetch error', error);
    }
  }

  useEffect(() => {
    fetchProblem();
  }, []);

  return (
    <div id='app'>
      <div id='toolbar'>
        <button>
          <img src={toggleViewIcon} alt='Toggle View Button Icon' />
        </button>
        <button>
          <img src={randomProblemIcon} alt='Random Problem Button Icon' />
        </button>
        <button>
          <img src={submitIcon} alt='Submit Button Icon' />
        </button>
      </div>
      <div id='container'>
        <div id='left'>
          <div id='problem-title'>{problem.title}</div>
          <div id='problem-difficulty'>{problem.difficulty}</div>
          <div>{problem.description}</div>
          <div>{problem.constraints}</div>
          <div id='problem-examples-container'>
            {problem.examples.map((example, index) => (
              <div key={index}>
                <div>{example.input}</div>
                <div>{example.output}</div>
                <div>{example.explanation}</div>
              </div>
            ))}
          </div>
        </div>
        <div id='right'>
          This is the right side
        </div>
      </div>
    </div>
  )
}

export default App
