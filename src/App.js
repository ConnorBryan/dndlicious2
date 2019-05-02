import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import { Formik, Field, Form } from "formik";
import Chance from "chance";
import {
  Button,
  Card,
  Container,
  Dropdown,
  Image,
  Menu,
  Grid,
  Header,
  Form as SemanticForm,
  Table
} from "semantic-ui-react";

import gameData from "./data/game.json";
import { CharacterField } from "./components";
import "./App.css";

export const PermissionContext = createContext();

const chance = new Chance();
const socketUrl =
  process.env.NODE_ENV === "production"
    ? "wss://142.93.30.81:9000"
    : "ws://localhost:9000";
const socket = new WebSocket(socketUrl);

function generateCharacterFields(character, prefix = "", noLabel) {
  return Object.entries(character).map(([key, value]) => {
    if (value.type) {
      // Field is an endpoint; render the component.
      return (
        <Field
          key={key}
          component={CharacterField}
          name={`${prefix}${key}.value`}
          {...value}
          noLabel={noLabel}
        />
      );
    }

    if (value.fields) {
      // Field is a group of related fields.
      return generateCharacterFields(value.fields, `${prefix}${key}.fields.`);
    }

    return null;
  });
}

function App() {
  const [permitted] = useState(true);
  const [game, setGame] = useState(gameData);
  const [activeCharacter, setActiveCharacter] = useState(0);
  const character = game.characters[activeCharacter];

  let timeout;

  function setCharacter(characterData) {
    const nextGame = {
      ...game,
      characters: game.characters.map((character, index) =>
        index === activeCharacter ? characterData : character
      )
    };

    setGame(nextGame);

    socket.send(JSON.stringify(nextGame));
  }

  function CharacterRoute({ path, property, prefix = "", noLabel }) {
    return (
      <Route
        path={path}
        render={() => (
          <Formik
            initialValues={{
              [property]: character[property]
            }}
            onSubmit={results =>
              setCharacter({
                ...character,
                [property]: results[property]
              })
            }
            validate={values => {
              clearTimeout(timeout);

              timeout = setTimeout(
                () =>
                  setCharacter({
                    ...character,
                    [property]: values[property]
                  }),
                250
              );
            }}
            render={({ handleChange }) => (
              <Form>
                {generateCharacterFields(
                  {
                    [property]: character[property]
                  },
                  prefix,
                  noLabel
                )}
              </Form>
            )}
          />
        )}
      />
    );
  }

  useEffect(() => {
    socket.onmessage = ({ data }) => setGame(JSON.parse(data));

    return socket.close;
  }, []);

  return (
    <Router>
      <PermissionContext.Provider value={permitted}>
        <Container fluid>
          <Menu size="huge" inverted fixed="top">
            <Dropdown item text="Active Character">
              <Dropdown.Menu>
                {game.characters.map((character, index) => (
                  <Dropdown.Item onClick={() => setActiveCharacter(index)}>
                    {character.name.value}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            <Menu.Item as={Link} to="/character/basics" name="Character" />
            <Menu.Item as={Link} to="/party" name="Party" />
            <Menu.Item as={Link} to="/encounter" name="Encounter" />
          </Menu>
        </Container>

        <Container fluid>
          <Grid>
            <Grid.Column
              width={3}
              style={{
                height: "100vh",
                overflowX: "hidden",
                overflowY: "auto",
                padding: 0,
                paddingTop: "10vh"
              }}
            >
              <Card>
                <Image src={character.image} size="small" centered />
                <Card.Content textAlign="center">
                  <Card.Header as="h1">{character.name.value}</Card.Header>
                  <Card.Description>
                    {character.basicInformation.fields.class.value}{" "}
                    {character.basicInformation.fields.level.value}{" "}
                    {character.basicInformation.fields.race.value}
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Card.Description>
                    <CharacterRoute path="/" property="inspiration" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Hit Points</Card.Header>
                  <Card.Description>
                    {character.hitPoints.fields.currentHitPoints.value} /{" "}
                    {character.hitPoints.fields.maximumHitPoints.value} (
                    {character.hitPoints.fields.temporaryHitPoints.value})
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Condition</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="condition" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Armor Class</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="armorClass" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Passive Perception</Card.Header>
                  <Card.Description>
                    <CharacterRoute
                      path="/"
                      property="passivePerception"
                      noLabel
                    />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Proficiency</Card.Header>
                  <Card.Description>
                    <CharacterRoute
                      path="/"
                      property="proficiencyBonus"
                      noLabel
                    />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Initiative</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="initiative" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Speed</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="speed" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Resources</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="resources" noLabel />
                  </Card.Description>
                </Card.Content>
                <Card.Content extra style={{ paddingLeft: "2rem" }}>
                  <Card.Header as="h4">Gold</Card.Header>
                  <Card.Description>
                    <CharacterRoute path="/" property="gold" noLabel />
                  </Card.Description>
                </Card.Content>
              </Card>
            </Grid.Column>
            <Grid.Column
              width={13}
              style={{
                paddingRight: 0
              }}
            >
              <Route
                path="/character"
                render={() => (
                  <Grid>
                    <Grid.Column
                      width={3}
                      stretched
                      style={{
                        height: "100vh",
                        overflowX: "hidden",
                        overflowY: "auto",
                        padding: 0,
                        paddingTop: "10vh"
                      }}
                    >
                      <Menu fluid vertical size="huge">
                        <Menu.Item
                          as={Link}
                          to="/character/basics"
                          name="Basic Information"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/abilities"
                          name="Ability Scores"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/saves"
                          name="Saving Throws"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/skills"
                          name="Skills"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/hp"
                          name="Hit Points"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/hitdice"
                          name="Hit Dice"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/deathsaves"
                          name="Death Saves"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/attacks"
                          name="Attacks and Spellcasting"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/proficiencies"
                          name="Proficiencies"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/equipment"
                          name="Equipment"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/features"
                          name="Features"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/mentality"
                          name="Mentality"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/physique"
                          name="Physique"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/backstory"
                          name="Backstory"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/allies"
                          name="Allies"
                        />
                        <Menu.Item
                          as={Link}
                          to="/character/spells"
                          name="Spells"
                        />
                      </Menu>
                    </Grid.Column>
                    <Grid.Column
                      width={13}
                      style={{
                        height: "100vh",
                        overflowX: "hidden",
                        overflowY: "auto",
                        padding: 0,
                        paddingTop: "6rem",
                        paddingLeft: "2rem",
                        paddingRight: "2rem"
                      }}
                    >
                      <SemanticForm as="div">
                        <CharacterRoute
                          path="/character/basics"
                          property="basicInformation"
                        />
                        <CharacterRoute
                          path="/character/abilities"
                          property="abilityScores"
                        />
                        <CharacterRoute
                          path="/character/saves"
                          property="savingThrows"
                        />
                        <CharacterRoute
                          path="/character/skills"
                          property="skills"
                        />
                        <CharacterRoute
                          path="/character/hp"
                          property="hitPoints"
                        />
                        <CharacterRoute
                          path="/character/hitdice"
                          property="hitDice"
                        />
                        <CharacterRoute
                          path="/character/deathsaves"
                          property="deathSaves"
                        />
                        <CharacterRoute
                          path="/character/attacks"
                          property="attacksAndSpellcasting"
                        />
                        <CharacterRoute
                          path="/character/proficiencies"
                          property="proficiencies"
                        />
                        <CharacterRoute
                          path="/character/equipment"
                          property="equipment"
                        />
                        <CharacterRoute
                          path="/character/features"
                          property="features"
                        />
                        <CharacterRoute
                          path="/character/mentality"
                          property="mentality"
                        />
                        <CharacterRoute
                          path="/character/physique"
                          property="physique"
                        />
                        <CharacterRoute
                          path="/character/backstory"
                          property="backstory"
                        />
                        <CharacterRoute
                          path="/character/allies"
                          property="alliesOrganizations"
                        />
                        <CharacterRoute
                          path="/character/spells"
                          property="spells"
                        />
                      </SemanticForm>
                    </Grid.Column>
                  </Grid>
                )}
              />
              <Route
                path="/party"
                render={() => (
                  <Table
                    textAlign="center"
                    style={{ marginTop: "6rem", marginRight: "2rem" }}
                  >
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Hit Points</Table.HeaderCell>
                        <Table.HeaderCell>Condition</Table.HeaderCell>
                        <Table.HeaderCell>Armor Class</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {game.characters.map(character => (
                        <Table.Row>
                          <Table.Cell>
                            <Image src={character.image} size="tiny" />
                          </Table.Cell>
                          <Table.Cell>
                            <Header as="h2">{character.name.value}</Header>
                          </Table.Cell>
                          <Table.Cell>
                            <Header as="h2">
                              {
                                character.hitPoints.fields.currentHitPoints
                                  .value
                              }{" "}
                              /{" "}
                              {
                                character.hitPoints.fields.maximumHitPoints
                                  .value
                              }{" "}
                              (
                              {
                                character.hitPoints.fields.temporaryHitPoints
                                  .value
                              }
                              )
                            </Header>
                          </Table.Cell>
                          <Table.Cell>
                            <Header as="h2">{character.condition.value}</Header>
                          </Table.Cell>
                          <Table.Cell>
                            <Header as="h2">
                              {character.armorClass.value}
                            </Header>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              />
              <Route
                path="/encounter"
                render={() => {
                  function Encounter() {
                    const [enemies, setEnemies] = useState({});

                    function startEncounter() {
                      const encounter = [];
                      const roll = bonus =>
                        chance.integer({ min: 1, max: 20 }) + Number(bonus);

                      game.characters.forEach(character => {
                        encounter.push({
                          name: character.name.value,
                          roll: roll(character.initiative.value)
                        });
                      });

                      if (enemies[`enemy0-name`]) {
                        const enemyRoll = roll(enemies[`enemy0-bonus`]);

                        encounter.push({
                          name: enemies[`enemy0-name`],
                          roll: enemyRoll
                        });
                      }
                      if (enemies[`enemy1-name`]) {
                        const enemyRoll = roll(enemies[`enemy1-bonus`]);

                        encounter.push({
                          name: enemies[`enemy1-name`],
                          roll: enemyRoll
                        });
                      }
                      if (enemies[`enemy2-name`]) {
                        const enemyRoll = roll(enemies[`enemy2-bonus`]);

                        encounter.push({
                          name: enemies[`enemy2-name`],
                          roll: enemyRoll
                        });
                      }
                      if (enemies[`enemy3-name`]) {
                        const enemyRoll = roll(enemies[`enemy3-bonus`]);

                        encounter.push({
                          name: enemies[`enemy3-name`],
                          roll: enemyRoll
                        });
                      }
                      if (enemies[`enemy4-name`]) {
                        const enemyRoll = roll(enemies[`enemy4-bonus`]);

                        encounter.push({
                          name: enemies[`enemy4-name`],
                          roll: enemyRoll
                        });
                      }

                      encounter.sort((a, b) => {
                        return b.roll - a.roll;
                      });

                      setGame({
                        ...game,
                        encounter
                      });
                    }

                    function next() {
                      const encounterClone = [...game.encounter];
                      const mostRecent = encounterClone.shift();

                      encounterClone.push(mostRecent);

                      setGame({
                        ...game,
                        encounter: encounterClone
                      });
                    }

                    function finish() {
                      setGame({
                        ...game,
                        encounter: []
                      });
                    }

                    if (game.encounter.length === 0) {
                      return (
                        <SemanticForm as="div" style={{ marginTop: "6rem" }}>
                          {Array.from({ length: 5 }, (_, index) => (
                            <SemanticForm.Field>
                              <input
                                type="text"
                                placeholder="Enemy name"
                                name={`enemy${index}-name`}
                                onChange={e => {
                                  setEnemies({
                                    ...enemies,
                                    [`enemy${index}-name`]: e.target.value
                                  });
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Enemy initiative bonus"
                                name={`enemy${index}-bonus`}
                                onChange={e => {
                                  setEnemies({
                                    ...enemies,
                                    [`enemy${index}-bonus`]: e.target.value
                                  });
                                }}
                              />
                            </SemanticForm.Field>
                          ))}
                          <SemanticForm.Button
                            type="submit"
                            onClick={startEncounter}
                          >
                            Start
                          </SemanticForm.Button>
                        </SemanticForm>
                      );
                    }

                    return (
                      <Table
                        textAlign="center"
                        style={{
                          marginTop: "6rem"
                        }}
                      >
                        <Table.Header>
                          <Table.Row>
                            <Table.HeaderCell>Combatant</Table.HeaderCell>
                            <Table.HeaderCell>Initiative</Table.HeaderCell>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {game.encounter.map(fighter => (
                            <Table.Row>
                              <Table.Cell>
                                <Header as="h2">{fighter.name}</Header>
                              </Table.Cell>
                              <Table.Cell>
                                <Header as="h2">{fighter.roll}</Header>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                        <Table.Footer>
                          <Table.Row>
                            <Table.Cell>
                              <Button onClick={next}>Next</Button>
                            </Table.Cell>
                            <Table.Cell>
                              <Button primary onClick={finish}>
                                Finish
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        </Table.Footer>
                      </Table>
                    );
                  }

                  return <Encounter />;
                }}
              />
            </Grid.Column>
          </Grid>
        </Container>
      </PermissionContext.Provider>
    </Router>
  );
}

export default App;
