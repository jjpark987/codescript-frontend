import { useEffect, useRef, useState } from 'react'
import toggleLeftIcon from './assets/toggle-left.png'
import toggleRightIcon from './assets/toggle-right.png'
import shuffleIcon from './assets/shuffle.png'
import playIcon from './assets/play.png'
import './App.css'
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';

// use for npm run build
// const RANDOM_PROBLEM_URL = 'http://codescript-demo-env.eba-edrru6it.us-east-2.elasticbeanstalk.com/problems/random';
// const GENERATE_FEEDBACK_URL = 'http://codescript-demo-env.eba-edrru6it.us-east-2.elasticbeanstalk.com/generate_feedback';
const RANDOM_PROBLEM_URL = import.meta.env.VITE_RANDOM_PROBLEM_URL
const GENERATE_FEEDBACK_URL = import.meta.env.VITE_GENERATE_FEEDBACK_URL


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

interface Response {
  analysis: string;
  suggestions: string[];
  score: number
}

function App() {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const submissionRef = useRef<string>('"""\n\n"""');

  const [problem, setProblem] = useState<Problem>({
    title: '',
    difficulty: '',
    description: '',
    constraints: [],
    examples: []
  });
  const [viewProblem, setViewProblem] = useState(true)
  const [response, setResponse] = useState<Response>({
    analysis: 'Submit your approach to get a response.',
    suggestions: [],
    score: 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialCodeEditorState = EditorState.create({
    doc: submissionRef.current,
    extensions: [
      basicSetup,
      python(),
      keymap.of([indentWithTab]),
      EditorView.updateListener.of(update => {
        if (update.docChanged) {
          submissionRef.current = update.state.doc.toString();
        }
      })
    ],
  });

  async function getProblem() {
    try {
      const response = await fetch(RANDOM_PROBLEM_URL);
      if (!response.ok) throw new Error('❌ App.getProblem -> API Error');
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
        difficulty: ({ 1: 'Easy', 2: 'Medium', 3: 'Hard' } as Record<number, string>)[problem_data.problem.difficulty],
        description: problem_data.problem.description,
        constraints: problem_data.problem.constraints,
        examples: problem_data.problem.examples
      });
    } catch (error) {
      console.error('❌ App.tsx -> Fetch error getting problem', error);
    }
  }
  
  useEffect(() => {
    getProblem();

    // configure codemirror
    if (editorRef.current && !viewRef.current) {
      viewRef.current = new EditorView({
        state: initialCodeEditorState,
        parent: editorRef.current,
      });
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, []);

  function toggleView() {
    setViewProblem(!viewProblem);
  }

  function randomProblem() {
    getProblem();
    if (viewRef.current) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: '"""\n\n"""' }
      });
    }
    setViewProblem(true);
    setResponse({
      analysis: 'Submit your approach to get a response.',
      suggestions: [],
      score: 0
    });
  }

  async function submit() {
    if (isSubmitting) return;

    setIsSubmitting(true);

    const request = {
      problem_data: {
        title: problem.title,
        description: problem.description,
        constraints: problem.constraints,
        examples: problem.examples
      },
      user_submission: submissionRef.current
    }
    console.log(request)

    try {
      const response = await fetch(GENERATE_FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        keepalive: true
      });
      if (!response.ok) throw new Error('❌ App.submit -> API Error');
      const submissionAnalysis = await response.json();

      setResponse({
        analysis: submissionAnalysis.analysis,
        suggestions: submissionAnalysis.suggestions,
        score: submissionAnalysis.score
      });

      setViewProblem(false);
    } catch (error) {
      console.error('❌ App.tsx -> Fetch error submitting response', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='app'>
      <div className='toolbar'>
        <button onClick={toggleView}>
          {viewProblem ? 
            <img src={toggleLeftIcon} alt='Toggle Left Icon' />
            :
            <img src={toggleRightIcon} alt='Toggle Right Icon' />
          }
        </button>
        <button className='disabled-btn' onClick={randomProblem} disabled={isSubmitting}>
          <img src={shuffleIcon} alt='Shuffle Icon' />
        </button>
        <button className='disabled-btn' onClick={submit} disabled={isSubmitting}>
          <img src={playIcon} alt='Play Icon' />
        </button>
      </div>
      <div className='container'>
        {viewProblem ?
          <div className='left-problem'>
            <div className='title'>{problem.title}</div>
            <div className={`difficulty ${problem.difficulty.toLowerCase()}`}>{problem.difficulty}</div>
            <div>{problem.description}</div>
            <div>
              {problem.constraints.map((constraint, index) => (
                <div key={index}>{constraint}</div>
              ))}
            </div>
            <div className='section-container'>
              {problem.examples.map((example, index) => (
                <div className='section' key={index}>
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
          :
          <div className='left-response'>
            <div className='left-response-details'>
              <div className='title'>{problem.title}</div>
              <div>{response.analysis}</div>
              <div className='section-container'>
                {response.suggestions.length !== 0 && 
                  <div className='section'>
                    <div>Suggestions:</div>
                    <ul className='suggestions-container'>
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                }
              </div>
            </div>
            <div className='score-bar-container'>
              <div
                className='score-bar' 
                style={{ backgroundColor: response.score == 0 ? 'white' : response.score === 1 ? 'red' : response.score === 2 ? 'orange' : 'green' }}
              />
            </div>
          </div>
        }
        <div className='right'>
          <div className='code-editor-header'>Write your approach in the comment block or code your solution in Python below it.</div>
          <div className='editor-wrapper'>
              <div ref={editorRef} className='editor-container' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
