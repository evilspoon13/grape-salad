import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Card, EmptyState, PageHeader } from "../components/ui";
import { useCreateMarket } from "../lib/queries";

interface MarketIdea {
  id: string;
  question: string;
  description: string;
}

const STARTER_NEWS =
  "Ty said he might start going to the gym before class. Cat is interviewing for a summer internship. Tate claims he is done ordering takeout this week.";

export default function NewsLab() {
  const [news, setNews] = useState(STARTER_NEWS);
  const [createdIds, setCreatedIds] = useState<string[]>([]);
  const createMarket = useCreateMarket();

  const digest = useMemo(() => makeDigest(news), [news]);
  const ideas = useMemo(() => makeMarketIdeas(news), [news]);

  async function createIdea(idea: MarketIdea) {
    const market = await createMarket.mutateAsync({
      question: idea.question,
      description: idea.description,
    });
    setCreatedIds((ids) => [...ids, market.id]);
  }

  async function createAll() {
    for (const idea of ideas) {
      await createIdea(idea);
    }
  }

  return (
    <section className="flex flex-col gap-5">
      <PageHeader eyebrow="News lab" title="Turn gossip into markets">
        <button
          onClick={createAll}
          disabled={createMarket.isPending || ideas.length === 0}
          className="btn-primary"
        >
          Create all
        </button>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="bg-[#ffe14d]">
          <div className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-black uppercase text-slate-950">Feed the machine</h2>
              <p className="text-sm font-bold text-slate-700">
                Paste friend news, plans, claims, rumors, or screenshots rewritten as text.
              </p>
            </div>
            <textarea
              value={news}
              onChange={(e) => {
                setNews(e.target.value);
                setCreatedIds([]);
              }}
              className="field min-h-56 resize-y text-base leading-6"
              placeholder="Example: Nat says she is moving apartments. Cam has a date Friday. Mat swears he will finish his project..."
            />
            <div className="flex flex-wrap gap-2">
              {["Cam", "Ty", "Mat", "Nat", "Cat", "Tate"].map((name) => (
                <button
                  key={name}
                  onClick={() => setNews((current) => `${current.trim()} ${name} `)}
                  className="btn-secondary px-3 py-1.5"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="bg-cyan-300">
          <h2 className="text-xl font-black uppercase text-slate-950">Digest</h2>
          {digest.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {digest.map((line) => (
                <li
                  key={line}
                  className="rounded-md border-2 border-slate-950 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-[3px_3px_0_#0f1028]"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-bold text-slate-700">
              Add a little news and this panel will pull out the useful bits.
            </p>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-black uppercase text-white drop-shadow-[3px_3px_0_#0f1028]">
          Suggested markets
        </h2>
        {ideas.length === 0 && (
          <EmptyState
            title="No market ideas yet"
            body="Give it a claim, plan, deadline, or prediction-worthy update."
          />
        )}
        <ul className="grid gap-3">
          {ideas.map((idea, index) => (
            <li key={idea.id}>
              <Card>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-slate-950 bg-[#ff4f8b] text-sm font-black text-white shadow-[3px_3px_0_#0f1028]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-black leading-6 text-slate-950">
                      {idea.question}
                    </p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {idea.description}
                    </p>
                  </div>
                  <button
                    onClick={() => createIdea(idea)}
                    disabled={createMarket.isPending}
                    className="btn-primary"
                  >
                    Create
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      {createdIds.length > 0 && (
        <Card className="bg-[#35e58f]">
          <p className="font-black uppercase text-slate-950">
            Created {createdIds.length} market{createdIds.length === 1 ? "" : "s"}.
          </p>
          <Link to="/markets" className="mt-2 inline-flex font-black uppercase text-slate-950 underline">
            Go bet on them
          </Link>
        </Card>
      )}
    </section>
  );
}

function makeDigest(input: string): string[] {
  return splitNews(input)
    .slice(0, 5)
    .map((item) => {
      const subject = findFriendName(item) ?? "The group";
      return `${subject}: ${tidySentence(item)}`;
    });
}

function makeMarketIdeas(input: string): MarketIdea[] {
  const items = splitNews(input);
  const ideas = items.map((item, index) => {
    const subject = findFriendName(item) ?? "Someone";
    const clean = tidySentence(item);
    const question = makeQuestion(subject, clean);

    return {
      id: `${index}-${question}`,
      question,
      description: `Generated from: "${clean}" Settle this based on what actually happens.`,
    };
  });

  return ideas.filter((idea, index, all) => {
    return all.findIndex((other) => other.question === idea.question) === index;
  });
}

function splitNews(input: string): string[] {
  return input
    .split(/\n|\.|\?|!/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 8)
    .slice(0, 8);
}

function findFriendName(text: string): string | null {
  return ["Cam", "Ty", "Mat", "Nat", "Cat", "Tate"].find((name) =>
    new RegExp(`\\b${name}\\b`, "i").test(text),
  ) ?? null;
}

function tidySentence(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function makeQuestion(subject: string, news: string): string {
  const lower = news.toLowerCase();

  if (lower.includes("gym") || lower.includes("workout")) {
    return `Will ${subject} work out at least 3 times this week?`;
  }
  if (lower.includes("interview") || lower.includes("internship") || lower.includes("job")) {
    return `Will ${subject} get good career news before next week?`;
  }
  if (lower.includes("date") || lower.includes("dating")) {
    return `Will ${subject}'s date actually happen?`;
  }
  if (lower.includes("takeout") || lower.includes("order")) {
    return `Will ${subject} avoid ordering takeout for the next 7 days?`;
  }
  if (lower.includes("move") || lower.includes("apartment")) {
    return `Will ${subject}'s moving plan be settled by Sunday?`;
  }
  if (lower.includes("project") || lower.includes("finish")) {
    return `Will ${subject} finish the thing they claimed they would finish?`;
  }

  return `Will ${subject}'s update come true by next week?`;
}
