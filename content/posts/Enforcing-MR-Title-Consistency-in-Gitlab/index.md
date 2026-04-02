---
title: 'Enforcing MR Title Consistency in Gitlab'
author: Richard Sween
description: Using Gitlab CI snippets to enforce rules about merge request formatting
date: 2024-06-20T20:50:21.162Z
featuredImage: hero.jpg
featuredImageAlt: A red fox with a blurry snowy background
draft: false
tags:
  - gitlab
  - ci
  - automation
---

In Gitlab there is a feature that allows you to use a regular expression (regex) pattern for branch names to enforce consistency in their naming (GitHub has a similar feature). You can also provide merge request (MR, a.k.a. pull requests in GitHub) templates to prompt users to enter information about what they’re trying to merge into development. But there’s no built-in way to enforce consistency in the merge request titles. Until now!

For some background, the team at HourWork was trying to build out some tooling to help automate our change logs and reporting. Part of this effort involved parsing issues from MR titles. However, we needed to ensure consistent usage of the same title format to avoid missing any issues in the tooling. After looking at the Gitlab API and Gitlab Runner documentation, I found that I could do everything I needed in just a Gitlab CI snippet.

> **Note**: While this tutorial is focused on Gitlab, there is a GitHub Action that looks to accomplish the same goal here: https://github.com/marketplace/actions/pull-request-title-rules. I don't have any experience using this Action so use at your own risk.

## The Snippet:

```yaml{numberLines: true}
mr-check:
  stage: test
  cache: []
  variables:
    DEFAULT_REGEX: '(Draft:\s)?(\[(#\d+|🔥|🔧|⭕|:fire:|:tools:|:o:)(, \#\d+)*\]|(\d{4}\.\d{2}\.\d{2}))\s[^"]+'
    DEFAULT_MESSAGE: 'Your MR does not have a valid title. Merge request titles should start with [\#ticketNum] or [\#ticket1, \#ticket2], or one of [🔥|🔧|⭕]. Please update the ticket title and rerun this job.'
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $IS_DEPLOYED_BRANCH != "true"
  before_script:
    - if [[ -z "$TITLE_REGEX" ]]; then TITLE_REGEX=$(echo $DEFAULT_REGEX); fi
    - INTERNAL_REGEX=$(echo "\"title\":\"$TITLE_REGEX\"")
    - if [[ -z "$TITLE_MESSAGE" ]]; then TITLE_MESSAGE=$(echo $DEFAULT_MESSAGE); fi
    - INTERNAL_MESSAGE=$(echo "$TITLE_MESSAGE")
  script:
    - >-
      MR=$(
        curl -H "Authorization: Bearer $GITLAB_ACCESS_TOKEN" "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID"
      )
    - echo $MR | grep -P "$INTERNAL_REGEX" -o || EXIT_CODE=$?
    - >-
      if [[ -n "$EXIT_CODE" ]]; then curl -X POST -d "body=$INTERNAL_MESSAGE" -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Bearer $GITLAB_ACCESS_TOKEN" "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes" && exit 1; fi
```

## Prerequisites

If you’re unfamiliar with Gitlab’s YAML CI format, check out their [documentation](https://docs.gitlab.com/ee/ci/yaml/). The snippet also assumes you have a basic understanding of bash scripting.

You will also need to setup a [Group or Project level CI variable](https://docs.gitlab.com/ee/ci/variables/#define-a-cicd-variable-in-the-ui) called "GITLAB_ACCESS_TOKEN". Set the value to a [project or group access token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html). Make sure the token has the `api` scope so that it can read and write to the API.

## Breaking it down

```yaml{numberLines: true}
mr-check:
  stage: .pre
  cache: []
```

This names the job `mr-check`, defines the job in the [special ".pre" stage](https://docs.gitlab.com/ee/ci/yaml/#stage-pre) that runs before any other user-defined jobs, and tells the script to skip restoring any caches, as they won’t be needed here. If you’re not using [Gitlab CI’s caching mechanism](https://docs.gitlab.com/ee/ci/caching/) (which you probably should be if you’re downloading NPM packages, etc.), you can omit this line.

```yaml{numberLines: 4}
variables:
    DEFAULT_REGEX: '(Draft:\s)?(\[(#\d+|🔥|🔧|⭕|:fire:|:tools:|:o:)(, \#\d+)*\]|(\d{4}\.\d{2}\.\d{2}))\s[^"]+'
    DEFAULT_MESSAGE: 'Your MR does not have a valid title. Merge request titles should start with [\#ticketNum] or [\#ticket1, \#ticket2], or one of [🔥|🔧|⭕]. Please update the ticket title and rerun this job.'
```

This section defines the default variables for the job. The 'DEFAULT_REGEX' specifies the title-matching regex. This is a default value that can be overridden per project by specifying a different value for "TITLE_REGEX". In the default case, it is looking for an MR title that starts with one or more ticket number in square brackets (e.g. [#123] or [#123, #456]) followed by some brief description of the MR. We also have escape hatches for MRs that don’t have tickets, like 🔥 for hotfixes or 🔧 for chores. Finally, we have a special title format for environment-to-environment MRs that start with that day's date (e.g. 2024.05.10). The DEFAULT_MESSAGE is what is sent to the user if the title doesn’t match the supplied regex.

```yaml{numberLines: 7}
 rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event" && $IS_DEPLOYED_BRANCH != "true"
```

This line defines when the job runs. We only want to run this job if the pipeline source is “merge_request_event” which means our job was triggered when we create or push changes to an MR.

```yaml{numberLines: 9}
before_script:
    - if [[ -z "$TITLE_REGEX" ]]; then TITLE_REGEX=$(echo $DEFAULT_REGEX); fi
    - INTERNAL_REGEX=$(echo "\"title\":\"$TITLE_REGEX\"")
    - if [[ -z "$TITLE_MESSAGE" ]]; then TITLE_MESSAGE=$(echo $DEFAULT_MESSAGE); fi
    - INTERNAL_MESSAGE=$(echo "$TITLE_MESSAGE")
```

This sets up the regex we will use to pull the title information out of the Gitlab API response. The API call returns a JSON object containing all the relevant information about the MR. In this case, we’re just interested in the value of the “title” field, so we need to set up a regex to pull just the title out. In the `before_script`, we check to see if the project has a defined “TITLE_REGEX” for that specific project. Otherwise, we use the “DEFAULT_REGEX” to create a new variable called “INTERNAL_REGEX” to look for the title match in the API response. We do a similar thing with setting a variable to hold the message to be sent to the user if the MR title doesn't pass the test.

```yaml{numberLines: 14}
 script:
    - >-
      MR=$(
        curl -H "Authorization: Bearer $GITLAB_ACCESS_TOKEN" "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID"
      )
```

Now for the meat of the script. First, we need to get the Gitlab API response for the contents of this MR. We use pre-defined Gitlab runner variables to setup our curl request: $CI_API_V4_URL contains the root of the URL for the API, $CI_PROJECT_ID is the current project’s Gitlab id, and $CI_MERGE_REQUEST_IID is the internal id of the project (i.e. within that specific project, not Gitlab globally - notice the second “I”). We store the response from the API in a variable called “MR”.

```yaml{numberLines: 19}
 - echo $MR | grep -P "$INTERNAL_REGEX" -o || EXIT_CODE=$?
    - >-
     if [[ -n "$EXIT_CODE" ]]; then curl -X POST -d "body=$INTERNAL_MESSAGE" -H "Content-Type: application/x-www-form-urlencoded" -H "Authorization: Bearer $GITLAB_ACCESS_TOKEN" "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests/$CI_MERGE_REQUEST_IID/notes" && exit 1; fi
```

Next we use our regex to test the MR variable to see if there is a match using the command line tool `grep`. If there is not a match, we store the exit code from `grep` in the variable “EXIT_CODE”. If “EXIT_CODE” has length > 0, we use the Gitlab API to add a note to the MR prompting the user to update the title of the MR to match the convention. Finally, we exit the job with a non-zero exit code, which means the job and pipeline fails so the MR cannot be merged until the error is fixed (assuming you require pipelines to pass before merging, which of course you do... _right_?).

## Usage

Save this script as `mr-check.yml` (or whatever you want to call it) somewhere within the group you want to use it in (a group is just a way to organize projects in Gitlab; groups can be nested for better organization and access control). We created a special "Gitlab Helpers" repo to store all of our shared Gitlab resources but this is optional. Once you have it saved, add the script to the include section of your project’s .gitlab-ci.yml file like so:

```yaml{numberLines: true}
include:
  - project: '<parent_group>/<subgroup>/<name_of_repo>'
    ref: 'main'
    file: 'ci-templates/mr-check.yml'
```

In this snippet, project is the full path to the repo where the snippet is stored (you may have 0+ subgroups in the example above, depending on your organization’s Gitlab setup). The ref is the commit/branch you want to use; in my case `main` is the default branch. Finally file is the path to the .yml file containing your mr-check snippet.

Alternatively, if you just want to use this in one project, you could always just copy the `mr-check` snippet into your .gitlab-ci.yml file directly. You could also edit the default variables and just use those directly without overriding them in your jobs.

And that’s it! Now when you create a new MR, the merge request pipeline will first create a job called `mr-check` that will verify that your title matches the regex you provided. If so, the job passes and the pipeline continues; if not, the job fails and you get a note telling you what you need to do to fix it.

## Future work

Now you have a script that can run every time you create a new MR in Gitlab! From here, we could add additional checks to the body, tags, or anything else that we have programmatic access to via the Gitlab API. You could add a check for an unchecked checkbox in a MR template or use a similar regex to look for linked issues. Anything that would help make your software process more robust, you can add to this script.

## Wrapping up

Now that all of our MR titles have the same information, we can write a script that publishes a changelog to Slack after every MR is merged. We can also automatically build our environment-to-environment MRs since the MR title is used as the merge commit in Gitlab. Both of these help with communication and developer experience, automating away time consuming tasks while ensuring better accuracy then doing them manually.
