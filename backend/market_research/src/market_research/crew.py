from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent
from typing import List
from crewai_tools import ScrapeWebsiteTool, SerperDevTool

search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()


@CrewBase
class MarketResearch():
    """MarketResearch crew"""

    agents: List[BaseAgent]
    tasks: List[Task]

    # Learn more about YAML configuration files here:
    # Agents: https://docs.crewai.com/concepts/agents#yaml-configuration-recommended
    # Tasks: https://docs.crewai.com/concepts/tasks#yaml-configuration-recommended
    
    # If you would like to add tools to your agents, you can learn more about it here:
    # https://docs.crewai.com/concepts/agents#agent-tools
    @agent
    def researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['researcher'], 
            tools=[search_tool, scrape_tool],
            verbose=True
        )

    @agent
    def competitive_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['competitive_analyst'], 
            verbose=True
        )
    
    @agent
    def forecast_analyst(self) -> Agent:
        return Agent(
            config=self.agents_config['forecast_analyst'], 
            verbose=True
        )

    @agent
    def report_synthesizer(self) -> Agent:
        return Agent(
            config=self.agents_config['report_synthesizer'], 
            verbose=True
        )

    # To learn more about structured task outputs,
    # task dependencies, and task callbacks, check out the documentation:
    # https://docs.crewai.com/concepts/tasks#overview-of-a-task
    @task
    def research_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_task'], # type: ignore[index]
        )

    @task
    def competitive_analysis_task(self) -> Task:
        return Task(
            config=self.tasks_config['competitive_analysis_task'], # type: ignore[index]
            context=[self.research_task()],
        )

    @task
    def forecast_task(self) -> Task:
        return Task(
            config=self.tasks_config['forecast_task'], # type: ignore[index]
        )

    @task
    def report_synthesis_task(self) -> Task:
        return Task(
            config=self.tasks_config['synthesis_task'], # type: ignore[index]
        )

    @crew
    def crew(self) -> Crew:
        """Creates the MarketResearch crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents, # Automatically created by the @agent decorator
            tasks=self.tasks, # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )
