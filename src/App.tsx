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
  constraints: string[];
  examples: Example[];
}

interface Example {
  imageUrl: string;
  input: string;
  output: string;
  explanation: string;
}

function App() {
  const [problem, setProblem] = useState<Problem>({
    title: '',
    difficulty: '',
    description: '',
    constraints: [],
    examples: []
  });
  async function fetchProblem() {
    try {
      const response = await fetch(RANDOM_PROBLEM_URL);
      // const response = await fetch('http://localhost:8000/problems/117');
      if (!response.ok) throw new Error('❌ App.tsx -> API Error');
      const problem_data = await response.json();

      const imageUrls = problem_data.image_urls;
      const examples: Example[] = problem_data.problem.examples;
      
      examples.forEach((example, index) => {
        if (imageUrls[index]) {
          example.imageUrl = imageUrls[index];
        }
      });

      setProblem({
        title: problem_data.problem.title,
        difficulty: ({ 1: 'Easy', 2: 'Medium', 3: 'Hard' } as Record<number, string>)[problem_data.problem.difficulty] || 'Unknown',
        description: problem_data.problem.description,
        constraints: problem_data.problem.constraints,
        examples: problem_data.problem.examples
      });
    } catch (error) {
      console.error('❌ App.tsx -> Fetch error', error);
    }
  }
  
  useEffect(() => {
    fetchProblem();
  }, []);
  console.log(problem)
  return (
    <div className='app'>
      <div className='toolbar'>
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
      <div className='container'>
        <div className='left'>
          <div className='title'>{problem.title}</div>
          <div className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</div>
          <div>{problem.description}</div>
          <div>
            {problem.constraints.map((constraint, index) => (
              <div key={index}>{constraint}</div>
            ))}
          </div>
          <div className='examples-container'>
            {problem.examples.map((example, index) => (
              <div className='example' key={index}>
                {example.imageUrl && (
                  <div className='image-container'>
                    <img src={example.imageUrl} alt='Example Image' />
                  </div>
                )}
                <div>Input: {example.input}</div>
                <div>Output: {example.output}</div>
                <div>{example.explanation}</div>
              </div>
            ))}
          </div>
        </div>
        <div className='right'>
          This is the right side
        </div>
      </div>
    </div>
  )
}

export default App
