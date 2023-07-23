import { Field, Bool, SmartContract, state, State, method, Circuit } from 'snarkyjs';

/**
 * zkRabbit - A zkApp for Mina
 * A hackathon project during ETHGlobal Paris 2023
 * 
 * A simple one-dimensional map with just five fields.
 * 
 * See https://docs.minaprotocol.com/zkapps for more info.
 */
export class Rabbit extends SmartContract {
  @state(Field) field = State<Field>();
  @state(Bool) gameEnded = State<Bool>();

  init() {
    super.init();
    this.field.set(Field(0));
    this.gameEnded.set(Bool(false));
  }

  @method move(nextField: Field){
    const currentField = this.field.getAndAssertEquals();

    //Assertions
    currentField.assertNotEquals(nextField);
    //Field borders (only x-axis, y=0)
    nextField.assertGreaterThanOrEqual(0);
    nextField.assertLessThanOrEqual(4);

    //If-else-statement
    this.gameEnded.set(Circuit.if(currentField.equals(Field(4)), Bool(true), Bool(false)));

    // Circuit.if(currentField.equals(Field(4)),
    //   ,
    //   this.gameEnded.set(Bool(true)),
    //   this.gameEnded.set(Bool(false))
    // );

    // if (currentField.equals(Field(4))) {
    //   this.gameEnded.set(Bool(true));
    // }

    this.field.set(nextField);
  }
}