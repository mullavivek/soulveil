"use client";

import { useState } from "react";

interface PollOption {
    text: string;
    votes: number;
}

interface PollProps {
    pollId: string;
    question: string;
    options: PollOption[];
    userVoted?: boolean;
}

export default function PollCard({ pollId, question, options, userVoted = false }: PollProps) {
    const [pollOptions, setPollOptions] = useState(options);
    const [hasVoted, setHasVoted] = useState(userVoted);

    const handleVote = async (index: number) => {
        if (hasVoted) return;

        try {
            const res = await fetch("/api/polls/vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pollId, optionIndex: index }),
            });

            if (!res.ok) throw new Error("Failed to vote");

            const updatedPoll = await res.json();
            setPollOptions(updatedPoll.options);
            setHasVoted(true);
        } catch (error) {
            console.error("Voting error:", error);
        }
    };

    return (
        <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{question}</h3>
            <ul>
                {pollOptions.map((option, index) => (
                    <li key={index} className="mb-1 flex justify-between">
                        <button
                            className={`px-4 py-2 rounded-lg w-full text-left ${
                                hasVoted ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white"
                            }`}
                            onClick={() => handleVote(index)}
                            disabled={hasVoted}
                        >
                            {option.text}
                        </button>
                        <span className="ml-2">{option.votes} votes</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
