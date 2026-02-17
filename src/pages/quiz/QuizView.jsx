import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getQuiz, getCourseQuizzes } from "../../api/quiz.api";
import Navbar from "../../components/Navbar";

export default function QuizView() {
    const { quizId, id: courseId } = useParams();
    const { user } = useSelector((state) => state.auth);

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Student quiz-taking state
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                const res = await getQuiz(quizId);
                setQuiz(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load quiz.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId]);

    const handleSelectOption = (questionId, option) => {
        if (submitted) return;
        setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    };

    const handleSubmit = () => {
        if (!quiz) return;

        let correct = 0;
        quiz.questions.forEach((q) => {
            if (selectedAnswers[q.id] === q.correct_answer) {
                correct++;
            }
        });

        setScore({
            correct,
            total: quiz.questions.length,
            percentage: Math.round((correct / quiz.questions.length) * 100),
        });
        setSubmitted(true);
    };

    const handleRetake = () => {
        setSelectedAnswers({});
        setSubmitted(false);
        setScore(null);
    };

    const getBackPath = () => {
        if (user?.role === "STUDENT") return `/student/courses/${courseId}`;
        return `/instructor/courses/${courseId}`;
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-black pt-24 px-6 text-white flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-gray-400">Loading quiz…</span>
                    </div>
                </div>
            </>
        );
    }

    if (error || !quiz) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-black pt-24 px-6 text-white">
                    <div className="max-w-3xl mx-auto text-center">
                        <p className="text-red-400 mb-4">{error || "Quiz not found."}</p>
                        <Link to={getBackPath()} className="text-emerald-400 hover:underline">
                            ← Back to Course
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-black pt-24 px-6 pb-20">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <Link to={getBackPath()} className="text-gray-400 hover:text-white mb-4 block">
                        &larr; Back to Course
                    </Link>

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
                            <p className="text-gray-400">
                                {quiz.questions.length} question{quiz.questions.length !== 1 ? "s" : ""}
                                {" · "}AI-Generated Quiz
                            </p>
                        </div>

                        {/* Score Badge */}
                        {submitted && score && (
                            <div
                                className={`px-5 py-3 rounded-xl text-center border ${score.percentage >= 70
                                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                        : score.percentage >= 40
                                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                                            : "bg-red-500/10 border-red-500/30 text-red-400"
                                    }`}
                            >
                                <div className="text-2xl font-bold">{score.percentage}%</div>
                                <div className="text-xs mt-1">
                                    {score.correct}/{score.total} correct
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Questions */}
                    <div className="space-y-6">
                        {quiz.questions.map((question, idx) => {
                            const selected = selectedAnswers[question.id];
                            const isCorrect = submitted && selected === question.correct_answer;
                            const isWrong = submitted && selected && selected !== question.correct_answer;

                            return (
                                <div
                                    key={question.id}
                                    className={`bg-zinc-900/50 border rounded-xl p-6 transition-all ${isCorrect
                                            ? "border-emerald-500/50"
                                            : isWrong
                                                ? "border-red-500/50"
                                                : "border-zinc-800"
                                        }`}
                                >
                                    <h3 className="text-white font-medium mb-4">
                                        <span className="text-emerald-400 font-mono mr-2">Q{idx + 1}.</span>
                                        {question.question_text}
                                    </h3>

                                    <div className="space-y-2">
                                        {question.options.map((opt) => {
                                            const isSelected = selected === opt.option_text;
                                            const isCorrectOption = submitted && opt.option_text === question.correct_answer;
                                            const isWrongSelected = submitted && isSelected && !isCorrectOption;

                                            let optClasses =
                                                "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ";

                                            if (submitted) {
                                                if (isCorrectOption) {
                                                    optClasses +=
                                                        "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
                                                } else if (isWrongSelected) {
                                                    optClasses +=
                                                        "bg-red-500/10 border-red-500/40 text-red-300";
                                                } else {
                                                    optClasses +=
                                                        "bg-zinc-800/30 border-zinc-700/50 text-gray-500";
                                                }
                                            } else {
                                                optClasses += isSelected
                                                    ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                                                    : "bg-zinc-800/50 border-zinc-700 text-gray-300 hover:border-zinc-600 hover:bg-zinc-800 cursor-pointer";
                                            }

                                            return (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => handleSelectOption(question.id, opt.option_text)}
                                                    className={optClasses}
                                                    disabled={submitted}
                                                >
                                                    {opt.option_text}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Show correct answer after submit */}
                                    {submitted && isWrong && (
                                        <p className="text-emerald-400 text-xs mt-3">
                                            ✓ Correct answer: {question.correct_answer}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex gap-4 justify-center">
                        {!submitted ? (
                            <button
                                onClick={handleSubmit}
                                disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
                                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed"
                            >
                                Submit Quiz ({Object.keys(selectedAnswers).length}/{quiz.questions.length} answered)
                            </button>
                        ) : (
                            <button
                                onClick={handleRetake}
                                className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-all border border-zinc-700"
                            >
                                Retake Quiz
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
