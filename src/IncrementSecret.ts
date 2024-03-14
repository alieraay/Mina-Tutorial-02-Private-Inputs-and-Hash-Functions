import { Field, state, State, method, SmartContract, Poseidon } from 'o1js';

export class IncrementSecret extends SmartContract {
  @state(Field) x = State<Field>();

  @method initState(salt: Field, firstSecret: Field) {
    this.x.set(Poseidon.hash([salt, firstSecret]));
  }
  @method incrementSecret(salt: Field, secret: Field) {
    const x = this.x.get();
    this.x.requireEquals(Field(x));

    Poseidon.hash([salt, secret]).assertEquals(x);
    this.x.set(Poseidon.hash([salt, secret.add(1)]));
  }
}
