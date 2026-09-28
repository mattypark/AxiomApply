"use client";

import { useState } from "react";
import { Card, ErrorCard, Kicker, PillLink, SkeletonCard } from "@/components/preview/Card";
import { PreviewControls, writeQuery } from "@/components/preview/PreviewControls";
import { StatusTrack } from "@/components/preview/applicant/StatusTrack";
import { NextCard } from "@/components/preview/applicant/NextCard";
import {
  STATE_OPTIONS,
  STATUS_OPTIONS,
  heroCopy,
  mailFor,
  toStage,
  type ViewState,
  type ViewStatus,
} from "@/components/preview/applicant/copy";
import { ANSWER_WITHIN, addDays, shortDate } from "@/components/preview/labels";
import { daysAgo } from "@/components/preview/mock-data";
import { usePath } from "@/lib/path-theme";

/**
 * Where a signed-in applicant lands after sending it: one sentence about
 * where it stands, the track that shows it, and — only once there is
 * something to act on — the match, the slate or the plan. Everything else
 * waits: the welcome page's rule of very little text holds here too.
 */

const SUBMITTED = daysAgo(4);
const READ = daysAgo(2);
const DECIDED = daysAgo(0);

export function ApplicantHome({ initialStatus, initialState }: { initialStatus: ViewStatus; initialState: ViewState }) {
  const side = usePath();
  const [status, setStatus] = useState(initialStatus);
  const [state, setState] = useState(initialState);
  const { stage } = toStage(status);
  const by = shortDate(addDays(SUBMITTED, ANSWER_WITHIN[side]));
  const hero = heroCopy(side, status, "Test", by);
  const mail = mailFor(side, status, { sent: shortDate(SUBMITTED), decided: shortDate(DECIDED), by });

  const controls = (
    <PreviewControls
      groups={[
        {
          key: "status",
          label: "Status",
          value: status,
          options: STATUS_OPTIONS,
          onChange: (value) => {
            setStatus(value as ViewStatus);
            writeQuery("status", value);
          },
        },
        {
          key: "state",
          label: "State",
          value: state,
          options: STATE_OPTIONS,
          onChange: (value) => {
            setState(value as ViewState);
            writeQuery("state", value === "ready" ? null : value);
          },
        },
      ]}
    />
  );

  if (state === "none") {
    return (
      <main className="mx-auto w-full max-w-[90rem] px-4 pt-8 pb-28 sm:px-[6.5%] sm:pt-16">
        <h1 className="ms-display ms-rise text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
          Welcome back,
          <br />
          Test.
        </h1>
        <p className="mt-5 max-w-[32rem] text-[19px] text-pretty text-ms-body">
          There&rsquo;s no application on this account yet. Sent one without signing in? Sign in with that same email and
          it shows up here.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PillLink href="/onboarding">Start your application</PillLink>
        </div>
        {controls}
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[90rem] px-4 pt-6 pb-28 sm:px-[6.5%] sm:pt-12">
      <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="text-[15px] font-medium text-ms-body">Your application</p>
          {state === "loading" ? (
            <div aria-hidden="true" className="mt-4 h-24 w-4/5 animate-pulse rounded-[20px] bg-white/60 motion-reduce:animate-none" />
          ) : (
            <>
              <h1 key={`${side}-${status}`} className="ms-display ms-rise mt-3 text-[clamp(2.8rem,5.4vw,5rem)] text-ms-ink">
                {hero.title}
              </h1>
              <p className="ms-rise mt-5 max-w-[30rem] text-[19px] text-pretty text-ms-body" style={{ ["--d" as string]: "90ms" }}>
                {hero.line}
              </p>
            </>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href="/preview/after-submit/application">See your application</PillLink>
          </div>
        </div>

        {state === "loading" ? (
          <SkeletonCard lines={2} />
        ) : state === "error" ? (
          <ErrorCard onRetry={() => setState("ready")} />
        ) : (
          <Card>
            <Kicker>Where it stands</Kicker>
            <div className="mt-6">
              <StatusTrack
                key={status}
                side={side}
                stage={stage}
                dates={[shortDate(SUBMITTED), stage === "received" ? null : shortDate(READ), stage === "decided" ? shortDate(DECIDED) : by]}
                expected={stage !== "decided"}
              />
            </div>
          </Card>
        )}
      </div>

      {state === "ready" ? (
        <div className="mt-6 grid gap-4 lg:mt-12 lg:grid-cols-[1.35fr_1fr]">
          <NextCard side={side} status={status} />
          <Card>
            <Kicker>From us</Kicker>
            <ul className="mt-4 flex flex-col">
              {mail.map((item) => (
                <li key={item.subject} className="flex items-baseline justify-between gap-4 border-t border-ms-mist py-3 first:border-t-0">
                  <span className={item.at ? "text-ms-ink" : "text-ms-muted"}>
                    <span className="block text-[16px] font-medium">{item.subject}</span>
                    <span className="block text-[13px] text-ms-muted">{item.note}</span>
                  </span>
                  <span className="shrink-0 text-[13px] text-ms-muted tabular-nums">{item.at ?? "soon"}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13px] text-ms-muted">
              Mail about your own application always comes. Network news is optional.
            </p>
          </Card>
        </div>
      ) : null}
      {controls}
    </main>
  );
}
